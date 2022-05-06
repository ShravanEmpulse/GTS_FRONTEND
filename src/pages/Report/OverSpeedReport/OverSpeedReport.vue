<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Over Speed Report</span>    
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
          <v-server-table  class="reportTableClass_overSpeed" ref="reportTable" :columns="columns" :options="options" @sorted="setSorted" @filter="setFilter">
          </v-server-table>
        </div>
    </Widget>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import downloadjs from 'downloadjs';
export default {
  name: 'OverSpeedReport',
  components: {
    Widget
  },
  data() {
    return {
      filter: [],
      sorted: {
        column: 'gpsDateTime',
        ascending: 0
      },
      columns: [ 'plateNo', 'baseSpeed', 'speed', 'overSpeed', 'latitude', 'longitude', 'address','gpsDateTime' ],
      options: {
        perPage:10,
        perPageValues:[10],
        skin: 'table table-striped',
        filterByColumn: true,
        dateColumns:['gpsDateTime'],
        dateFormat: 'DD MMM, YYYY',
        toMomentFormat: 'YYYYMMDDHHmmss',
        sortable: ['plateNo',   'baseSpeed', 'speed', 'overSpeed', 'gpsDateTime' ],
        orderBy: { ascending: false },
        datepickerOptions: {
            showDropdowns: true,
            autoUpdateInput: true,
            maxSpan: {"month":1},
            maxDate: this.$moment(),
        },
        texts:{
            filterBy: "Search by...",
        },
        filterable: [ 'plateNo', 'baseSpeed', 'speed', 'overSpeed', 'latitude', 'longitude', 'address','gpsDateTime' ],
        headings: {
          plateNo: 'PLATE NO',
          baseSpeed: 'BASE SPEED (km/h)',
          speed: 'SPEED (km/h)',
          overSpeed: 'OVER SPEED (km/h)',
          latitude: 'LATITUDE',
          longitude: 'LONGITUDE',
          address: 'ADDRESS',
          gpsDateTime: 'GPS DATE TIME',
        },
        headingsTooltips:{
          gpsDateTime: 'Please click the below column to select the date range.',
		  	},
        requestAdapter: function(data) {
          return {
            ascending: data.ascending,
            byColumn: data.byColumn,
            pageSize: data.limit,
            orderBy: data.orderBy ? data.orderBy : "gpsDateTime",
            page: data.page,
            query: data.query,
            pageResult: ((data.page-1)*data.limit)
          };
        },
        requestFunction: function (data) {
          return this.$axios.get('/api/report/overspeedReport', {
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
          gpsDateTime: function(h,row) {
             if(row.gpsDateTime == null || row.gpsDateTime==''){
                return "";
              }else{
                return this.$moment(row.gpsDateTime, 'YYYYMMDDHHmmss').format('DD MMM, YYYY HH:mm:ss');
              }
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

      if(filter.name == "vf__gpsDateTime"){
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
        url: '/api/report/overspeedReportForExcel',
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
        downloadjs(response.data,'Overspeed_Report.xlsx');
      }).catch((ex)=> {
        this.showErrorAlert(ex.response.status);
      }); 

    },
  },
}
</script>
