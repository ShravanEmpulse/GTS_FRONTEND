<template>
  <div>
    <h4 class="page-title">    
      <span>Yearly Trailer Summary Report</span>    
    </h4> 
    <b-row>
      <b-col lg='12' xs='12'>
        <Widget
          title="<h5>  <span class='fw-semi-bold'>Yearly</span> Distance Summary Graph</h5>"
          customHeader
        >
          <div>
            <div class="daterange">
              Year 
              <div>
                <DatePicker lang="en" type="year" v-model="datepickerYear" :format="datepicketFormatYear" input-class="form-control" width="110">
                  <i class="glyphicon glyphicon-glyph-calendar" slot="calendar-icon" />
                </DatePicker>
              </div>
            </div><br><br><hr>
            <div>
              <line-chart 
                  id="yearlySum" 
                  :data="yearlySumGraph"
                  xkey="month"
                  :ykeys="transporterList"
                  line-colors = '["#4e85bd","#25b932","#f0af03","#e671b8","#14d3d3"]'
                  :labels="transporterList"
                  grid-text-color= "#c1ccd3"
                  grid="ture"
                  grid-text-weight="bold"
                  resize="true"
                  parseTime="false"
                  hideHover="true"
                  lineWidth="3px"
                  stacked="true"
                  :y-label-format="kmFormat"
                  class="status-graph">
              </line-chart>
            </div>
            <hr><br>
          </div>
        </Widget>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg='12' xs='12'>
        <Widget
          title="<h5>  <span class='fw-semi-bold'>Yearly</span> Distance Summary Report</h5>"
          customHeader
        >
            <div class="widget-middle-overflow">
              <hr>
            <div class="export-button">
              <b-button
                variant="outline-default"
                @click="exportExcel()">
                EXPORT EXCEL
              </b-button>
            </div>
            <v-server-table  class="reportTableClass" ref="reportTable" :columns="columns" :options="options" @sorted="setSorted" @filter="setFilter">
            </v-server-table>
          </div>
        </Widget>
      </b-col>
    </b-row>
  </div>  
</template>


<script>
import $ from 'jquery';
import Raphael from 'raphael/raphael';
global.Raphael = Raphael;
/* eslint-disable */
import 'imports-loader?jQuery=jquery,this=>window!govpredict-morris/morris';
/* eslint-enable */
import Widget from '@/components/Widget/Widget';
import DatePicker from 'vue2-datepicker';

import { LineChart } from 'vue-morris';
import downloadjs from 'downloadjs';

export default {
  name: 'TrailerSummaryReport',
  components: { Widget, DatePicker, LineChart },
  data(){
    return {
      datepickerYear: new Date(),
      datepicketFormatYear: 'YYYY',

      yearlySumGraph: [],

      transporterList: [""],

      //table
      filter: [],
      sorted: {
        column: 'transporterName',
        ascending: 0
      },
      columns: ['driveMonth', 'transporterName', 'plateNo','distance', 'speed'],
      options: {
        perPage:10,
        perPageValues:[10],
        skin: 'table table-striped',
        filterByColumn: true,
        orderBy: { ascending: false },
        texts:{
            filterBy: "Search by...",
        },
        sortable: ['transporterName', 'plateNo','distance', 'speed' ],
        filterable: ['transporterName', 'plateNo'],
        headings: {
          transporterName: 'TRANSPORTER',
          plateNo: 'PLATE NO',
          driveMonth: 'YEAR',
          distance: 'DISTANCE (KM)',
          speed: 'SPEED (km/h)'
        },
        requestAdapter: (data) => {
          const driveYear = this.$moment(this.datepickerYear).format('YYYY');
          return {
            ascending: data.ascending,
            byColumn: data.byColumn,
            pageSize: data.limit,
            orderBy: data.orderBy ? data.orderBy : "transporterName",
            page: data.page,
            query: data.query,
            pageResult: ((data.page-1)*data.limit),
            driveYear: driveYear
          };
        },
        requestFunction: function (data) {
          return this.$axios.get('/api/report/yearlySumTrailerDistanceByPlateNo', {
                params: data
          }).catch(function (e) {
                this.dispatch('error', e);
          }.bind(this));
        },
        responseAdapter: (response) => {
          console.log(response);
          return {
            data: response.data.resultBody.data,
            count: response.data.resultBody.count
          }
        },
        templates: {
          distance: function(h,row){
            let regexp = /\B(?=(\d{3})+(?!\d))/g;
            return row.distance.toString().replace(regexp, ',');
          },
        }
      }
    }
  },
  watch:{
    datepickerYear: function(){
      this.getYearlySumGraph();
      this.getReportData();
    },
  },
  created(){
    this.getTransporter();
    this.getYearlySumGraph();
  },
  methods: {
      showErrorAlert(status) {
        this.$swal({
            title: 'Error',
            text: status,
            confirmButtonText: 'OK'
        });
      },
      getYear(){
        return this.$moment(this.datepickerYear,'YYYYMMDD').format('YYYY');
      },
      getTransporter(){
        return new Promise( (resolve, reject) => {
          this.$axios.get('/api/report/transporterList')
          .then((response) => {
              console.log(response);
              this.transporterList = response.data.resultBody;
              return resolve(this.transporterList);
          }).catch((ex)=> {
              console.log(ex);
          })
        })
      },
      async getYearlySumGraph(){
        const transporter = await this.getTransporter();

        if(transporter){
          this.$axios.get('/api/report/yearlySumTrailerDistance',{
            params: { driveYear: this.getYear()}
          })
          .then((response) => {
              console.log(response);
              this.yearlySumGraph = response.data.resultBody;
          }).catch((ex)=> {
              console.log(ex);
          })
        }
      },
      kmFormat(val){
        let regexp = /\B(?=(\d{3})+(?!\d))/g;
        val = val+"";
        return val.toString().replace(regexp, ',')+" km";
      },
      setSorted(sorted){
        this.sorted = sorted;
      },
      setFilter(filter){
        let filterValue = filter.value;

        this.filter.push({
          name: filter.name,
          value: filterValue
        });
      },
      getReportData(){
        this.$refs.reportTable.getData();
      },
      exportExcel(){
        this.$axios({
        method: 'post',
        url: '/api/report/yearlySummaryReportForExcel',
        params:{
          driveYear: this.$moment(this.datepickerYear).format('YYYY')
        },
        data:{
          filter: this.filter, 
          orderBy: this.sorted.column, 
          ascending: this.sorted.ascending ? 1 : 0
        },
        withCredentials: true,
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument'
           + '.spreadsheetml.sheet',
        },
      }).then(function(response) {
        console.log(response);
        downloadjs(response.data,'Yearly_Summary_Report.xlsx');
      }).catch((ex)=> {
        this.showErrorAlert(ex);
      }); 
    },
  },
};
</script>
