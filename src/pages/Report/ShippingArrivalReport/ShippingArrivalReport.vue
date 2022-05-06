<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Shipping Arrival Report</span>    
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
            <template slot="forceArrivalYN" slot-scope="{ row }">
              <b-badge v-if="row.forceArrivalYN === 'Y'" variant="warning" class="arrival-button">Auto</b-badge>
              <b-badge v-if="row.forceArrivalYN === 'N'" variant="primary" class="arrival-button">Arrival</b-badge>
            </template>
          </v-server-table>
        </div>
    </Widget>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import downloadjs from 'downloadjs';
export default {
  name: 'ShippingArrivalReport',
  components: {
    Widget
  },
  data() {
    return {
      filter: [],
      sorted: {
        column: 'arrivalDate',
        ascending: 0
      },
      columns: ['transporterName', 'plateNo', 'tiNo','dealerCode', 'dealerName', 'destName', 'departureName', 'departureDate', 'eta', 'arrivalDate', 'forceArrivalYN'],
      options: {
        perPage:10,
        perPageValues:[10],
        skin: 'table table-striped',
        filterByColumn: true,
        dateColumns:['departureDate', 'eta', 'arrivalDate'],
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
          forceArrivalYN:[
            {
              id: 'Y',
              text: 'Auto'
            },
            {
              id: 'N',
              text: 'Arrival'
            }
          ]
        },
        sortable: ['departureDate', 'eta', 'arrivalDate'],
        filterable: [ 'transporterName', 'plateNo', 'tiNo', 'dealerCode','dealerName', 'destName', 'departureName','departureDate', 'eta', 'arrivalDate', 'forceArrivalYN'],
        texts:{
            filterBy: "Search by...",
            defaultOption: "ALL",
        },
        headings: {
          transporterName: 'TRANSPORTER',
          plateNo: 'PLATE NO',
          tiNo: 'TI NO',
          dealerCode: 'DEALER CODE',
          dealerName: 'DEALER NAME',
          destName: 'DESTINATION',
          departureName: 'DEPARTURE',
          departureDate: 'DEP DATE',
          eta: 'ETA',
          arrivalDate: 'ARRIVAL DATE',
          forceArrivalYN: 'ARRIVAL'
        },
        headingsTooltips:{
          departureDate: 'Please click the below column to select the date range.',
          eta:'Please click the below column to select the date range.',
          arrivalDate: 'Please click the below column to select the date range.'
		  	},
        requestAdapter: function(data) {
          return {
            ascending: data.ascending,
            byColumn: data.byColumn,
            pageSize: data.limit,
            orderBy: data.orderBy ? data.orderBy : "arrivalDate",
            page: data.page,
            query: data.query,
            pageResult: ((data.page-1)*data.limit)
          };
        },
        requestFunction: function (data) {
          return this.$axios.get('/api/report/shippingArrivalReport', {
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
          arrivalDate: function(h,row) {
            if(row.arrivalDate == null || row.arrivalDate==''){
              return "";
            }else{
              return this.$moment(row.arrivalDate, 'YYYYMMDDHHmmss').format('DD MMM, YYYY HH:mm:ss');
            }
          },
        }
      }
    }
  },
  mounted() {

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

      if(filter.name == "vf__departureDate" || filter.name == "vf__eta" || filter.name == "vf__arrivalDate"){
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
        url: '/api/report/shippingArrivalReportForExcel',
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
        downloadjs(response.data,'Shipping_Arrival_Report.xlsx');
      }).catch((ex)=> {
        this.showErrorAlert(ex.response.status);
      }); 

    },
  },
}
</script>
