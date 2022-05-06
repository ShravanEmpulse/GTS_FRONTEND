<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Tracking Report</span>    
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
import moment from 'moment/moment';
export default {
  name: 'TrackingReport',
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
      columns: ['transporterName', 'plateNo', 'tiNo', 'departureName', 'departureDate', 'arrivalDate', 'totalTransitDays', 'totalDistance'],
      options: {
        perPage:10,
        perPageValues:[10],
        skin: 'table table-striped',
        filterByColumn: true,
        dateColumns:['departureDate', 'arrivalDate'],
        dateFormat: 'DD MMM, YYYY',
        toMomentFormat: 'YYYYMMDDHHmmss',
        datepickerOptions: {
            showDropdowns: true,
            autoUpdateInput: false,
            maxSpan: {"month":1},
            maxDate: this.$moment(),
        },
        orderBy: { ascending: false },
        texts:{
            filterBy: "Search by...",
        },
        sortable: ['departureDate', 'arrivalDate', 'totalTransitDays', ],
        filterable: ['transporterName', 'plateNo', 'tiNo', 'departureName', 'departureDate', 'arrivalDate', 'totalTransitDays', 'totalDistance'],
        headings: {
          transporterName: 'TRANSPORTER',
          plateNo: 'PLATE NO',
          tiNo: 'TI NO',
          destName: 'DESTINATION',
          departureName: 'DEPARTURE',
          departureDate: 'DEP DATE',
          arrivalDate: 'ARRIVAL DATE',
          totalTransitDays: 'TRANSIT DAYS',
          totalDistance: 'DISTANCE (KM)'
        },
        headingsTooltips:{
          departureDate: 'Please click the below column to select the date range.',
			    arrivalDate:'Please click the below column to select the date range.'
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
          return this.$axios.get('/api/report/trackingReport', {
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
            if(row.departureDate == null || row.departureDate ==''){
                return "";
              }else{
                return this.$moment(row.departureDate, 'YYYYMMDDHHmmss').format('DD MMM, YYYY HH:mm:ss');
            }
          },
          arrivalDate: function(h,row) {
            if(row.arrivalDate == null || row.arrivalDate ==''){
                return "";
              }else{
                return this.$moment(row.arrivalDate, 'YYYYMMDDHHmmss').format('DD MMM, YYYY HH:mm:ss');
            }
          },
          totalTransitDays: function(h,row){
            return row.totalTransitDays +' Days';
          },
          totalDistance: function(h,row){
            let regexp = /\B(?=(\d{3})+(?!\d))/g;
            return row.totalDistance.toString().replace(regexp, ',');
          }
        }
      }
    }
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

      if(filter.name == "vf__departureDate" || filter.name == "vf__arrivalDate"){
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
        url: '/api/report/trackingReportForExcel',
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
        downloadjs(response.data,'Tracking_Report.xlsx');
      }).catch((ex)=> {
        this.showErrorAlert(ex.response.status);
      }); 
    },
  },
}
</script>
