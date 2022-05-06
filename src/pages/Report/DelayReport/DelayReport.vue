<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Delay Report</span>    
    </h4> 
    <Widget
      title="<h4></h4>"
      customHeader
      >
        <div class="widget-middle-overflow">
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
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import downloadjs from 'downloadjs';
export default {
  name: 'DelayReport',
  components: {
    Widget
  },
  data() {
    return {
      filter: [],
      sorted: {
        column: 'eta',
        ascending: 0
      },
      columns: ['transporterName', 'plateNo', 'tiNo', 'dealerCode', 'dealerName', 'destName', 'departureName', 'departureDate', 'eta', 'delayDays'],
      options: {
        perPage:10,
        perPageValues:[10],
        skin: 'table table-striped',
        filterByColumn: true,
        dateColumns:['departureDate', 'eta'],
        dateFormat: 'DD MMM, YYYY',
        toMomentFormat: 'YYYYMMDDHHmmss',
        datepickerOptions: {
            showDropdowns: true,
            autoUpdateInput: true,
            maxSpan: {"month":1},
            maxDate: this.$moment(),
        },
        orderBy: { ascending: false },
        listColumns:{
          delayDays:[
            {
              id: '1',
              text: '1 Day'
            },
            {
              id: '2',
              text: '2 Days'
            },
            {
              id: '3',
              text: '3 Days'
            },
            {
              id: '4',
              text: '4 Days Above'
            }
          ]
        },
        sortable: ['departureDate', 'eta', 'delayDays'],
        filterable: ['transporterName', 'plateNo', 'tiNo', 'dealerCode','dealerName', 'destName', 'departureName','departureDate', 'eta', 'delayDays'],
        texts:{
            defaultOption: "ALL",
            filterBy: "Search by...",
        },
        headings: {
          transporterName: 'TRANSPORTER',
          plateNo: 'PLATE NO',
          tiNo: 'TI NO',
          dealerName : 'DEALER NAME',
          dealerCode: 'DEALER CODE',
          destName: 'DESTINATION',
          departureName: 'DEPARTURE',
          departureDate: 'DEP DATE',
          eta: 'ETA',
          delayDays: 'DELAY'
        },
        headingsTooltips:{
          departureDate: 'Please click the below column to select the date range.',
          eta:'Please click the below column to select the date range.',
		  	},
        requestAdapter: function(data) {
          return {
            ascending: data.ascending,
            byColumn: data.byColumn,
            pageSize: data.limit,
            orderBy: data.orderBy ? data.orderBy : "eta",
            page: data.page,
            query: data.query,
            pageResult: ((data.page-1)*data.limit)
          };
        },
        requestFunction: function (data) {
          return this.$axios.get('/api/report/delayReport', {
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
          departureDate: function(h,row) {
            if(row.departureDate == null || row.departureDate==''){
                return "";
              }else{
                return this.$moment(row.departureDate, 'YYYYMMDDHHmmss').format('DD MMM, YYYY HH:mm:ss');
              }
          },
           eta: function(h,row) {
             if(row.eta == null || row.eta==''){
                return "";
              }else{
                return this.$moment(row.eta, 'YYYYMMDD').format('DD MMM, YYYY');
              }
          },
          delayDays: function(h, row){
            return row.delayDays+' Days';
          },
        }
      }
    }
  },
  computed: {

  },
  methods: {
    showErrorAlert(status) {
      this.$swal({
          title: 'Error',
          text: status,
          confirmButtonText: 'OK'
      });
    },
    setSorted(sorted){
      this.sorted = sorted;
    },
    setFilter(filter){

      let filterValue = filter.value;
      let value = JSON.stringify(filter.value);

      if(filter.name == "vf__departureDate" || filter.name == "vf__eta"){
        if(value != '""'){
          filterValue = value;
        }
      }

      this.filter.push({
        name: filter.name,
        value: filterValue
      });

    },
    exportExcel(){

        this.$axios({
        method: 'post',
        url: '/api/report/delayReportForExcel',
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
        downloadjs(response.data,'Delay_Report.xlsx');
      }).catch((ex)=> {
        this.showErrorAlert(ex.response.status);
      }); 

    },
  },
}
</script>

<style src="../Report.scss" lang="scss" />