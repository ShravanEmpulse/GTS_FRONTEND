<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Domestic Geo-fence History</span>    
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
        column: 'gpsReceiveTime',
        ascending: 0
      },
      columns: [ 'plateNo','trailerEvent', 'destination', 'address', 'gpsReceiveTime' ],
      options: {
        perPage:10,
        perPageValues:[10],
        skin: 'table table-striped',
        filterByColumn: true,
        dateColumns:['gpsReceiveTime',],
        dateFormat: 'DD MMM, YYYY',
        toMomentFormat: 'YYYYMMDDHHmmss',
        datepickerOptions: {
            showDropdowns: true,
            autoUpdateInput: true,
            maxSpan: {"month":1},
            maxDate: this.$moment(),
        },
        orderBy: { ascending: false },
        sortable: [ 'plateNo','trailerEvent', 'destination', 'address', 'gpsReceiveTime'  ],
        filterable: [ 'plateNo','trailerEvent', 'destination', 'address', 'gpsReceiveTime'  ],
        texts:{
            defaultOption: "ALL",
            filterBy: "Search by...",
        },
        headings: {
          plateNo: 'PLATE NO',
          destination: 'UNLOADING POINT',
          trailerEvent: 'TRAILER STATUS',
          gpsReceiveTime: 'GEO-FENCE EVENT TIME',
        },
        headingsTooltips:{
          gpsReceiveTime: 'Please click the below column to select the date range.'
		  	},
        listColumns:{
          trailerEvent:[
            {
              id: 'GEOFENCE-IN',
              text: 'GEO-FENCE IN'
            },
            {
              id: 'GEOFENCE-OUT',
              text: 'GEO-FENCE OUT'
            }
          ]
        },
        requestAdapter: function(data) {
          return {
            ascending: data.ascending,
            byColumn: data.byColumn,
            pageSize: data.limit,
            orderBy: data.orderBy ? data.orderBy : "gpsReceiveTime",
            page: data.page,
            query: data.query,
            pageResult: ((data.page-1)*data.limit)
          };
        },
        requestFunction: function (data) {
          return this.$axios.get('/api/report/domesticGeofenceHistory', {
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
          gpsReceiveTime: function(h,row) {
            if(row.gpsReceiveTime == null || row.gpsReceiveTime==''){
                return "";
              }else{
                return this.$moment(row.gpsReceiveTime, 'YYYYMMDDHHmmss').format('DD MMM, YYYY HH:mm:ss');
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

      if(filter.name == "vf__gpsReceiveTime"){
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
        url: '/api/report/domesticGeofenceHistoryForExcel',
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
        downloadjs(response.data,'Domestic_Geofence_History.xlsx');
      }).catch((ex)=> {
        this.showErrorAlert(ex.response.status);
      }); 

    },
  },
}
</script>
