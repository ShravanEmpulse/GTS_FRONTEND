<template>
  <div>
    <h4 class="page-title">    
      <span>Monthly Trailer Summary Report</span>    
    </h4> 
    <b-row>
      <b-col lg='12' xs='12'>
        <Widget
          title="<h5>  <span class='fw-semi-bold'>Monthly</span> Distance Summary Graph</h5>"
          customHeader
        >
          <div>
            <div class="daterange">
              Month 
              <div>
                <DatePicker lang="en" type="month" v-model="datepickerMonth" :format="datepicketFormatMonth" input-class="form-control" width="110">
                  <i class="glyphicon glyphicon-glyph-calendar" slot="calendar-icon" />
                </DatePicker>
              </div>
            </div><br><br><hr>
            <div>
              <bar-chart 
                  id="monthlySum" 
                  :data="monthlySumGraph"
                  xkey="x"
                  ykeys='["y"]'
                  labels='["Total Distance"]'
                  bar-colors='["#12BDBD"]'
                  grid-text-color="#c1ccd3"
                  grid="ture"
                  grid-text-weight="bold"
                  resize="true"
                  parseTime="false"
                  hideHover="true"
                  lineWidth="3px"
                  stacked="true"
                  :y-label-format="kmFormat"
                  class="status-graph">
              </bar-chart>
            </div>
            <hr><br>
          </div>
        </Widget>
      </b-col>
    </b-row>
    <b-row>
      <b-col lg='12' xs='12'>
        <Widget
          title="<h5>  <span class='fw-semi-bold'>Monthly</span> Distance Summary Report</h5>"
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

import { BarChart } from 'vue-morris';
import downloadjs from 'downloadjs';

export default {
  name: 'TrailerSummaryReport',
  components: { Widget, DatePicker, BarChart },
  data(){
    return {
      datepickerMonth: this.$moment(new Date, "HHmmss").subtract(1, 'month').toDate(),
      datepicketFormatMonth: 'MMM, YYYY',

      monthlySumGraph: [],

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
          driveMonth: 'MONTH',
          distance: 'DISTANCE (KM)',
          speed: 'SPEED (km/h)'
        },
        requestAdapter: (data) => {
          const driveMonth = this.$moment(this.datepickerMonth).format('YYYYMM');
          return {
            ascending: data.ascending,
            byColumn: data.byColumn,
            pageSize: data.limit,
            orderBy: data.orderBy ? data.orderBy : "transporterName",
            page: data.page,
            query: data.query,
            pageResult: ((data.page-1)*data.limit),
            driveMonth: driveMonth
          };
        },
        requestFunction: function (data) {
          return this.$axios.get('/api/report/monthlySumTrailerDistanceByPlateNo', {
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
    datepickerMonth: function(){
      this.getMonthlySumGraph();
      this.getReportData();
    },
  },
  created(){
    this.getMonthlySumGraph();
  },
  methods: {
      showErrorAlert(status) {
        this.$swal({
            title: 'Error',
            text: status,
            confirmButtonText: 'OK'
        });
      },
      getMonth(){
        return this.$moment(this.datepickerMonth,'YYYYMMDD').format('YYYYMM');
      },
      getMonthlySumGraph(){
        this.$axios.get('/api/report/monthlySumTrailerDistance',{
          params: { driveMonth: this.getMonth()}
        })
        .then((response) => {
            console.log(response);
            this.monthlySumGraph = response.data.resultBody;
        }).catch((ex)=> {
            console.log(ex);
        })
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
        url: '/api/report/monthlySummaryReportForExcel',
        params:{
          driveMonth: this.$moment(this.datepickerMonth).format('YYYYMM')
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
        downloadjs(response.data,'Monthly_Summary_Report.xlsx');
      }).catch((ex)=> {
        this.showErrorAlert(ex);
      }); 
    },
  },
};
</script>
