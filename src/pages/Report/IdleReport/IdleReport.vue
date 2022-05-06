<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Idle Report</span>    
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
  name: 'IdleReport',
  components: {
    Widget
  },
  data() {
    return {
      filter: [],
      sorted: {
        column: 'idleStopTime',
        ascending: 0
      },
      columns: ['transporterName', 'plateNo', 'tiNo', 'departureName', 'departureDate', 'idleStartTime', 'idleStopTime', 'diffTime'],
      options: {
        perPage:10,
        perPageValues:[10],
        skin: 'table table-striped',
        filterByColumn: true,
        dateColumns:['departureDate', 'idleStartTime', 'idleStopTime'],
        dateFormat: 'DD MMM, YYYY',
        toMomentFormat: 'YYYYMMDDHHmmss',
        sortable: ['transporterName', 'plateNo', 'tiNo', 'departureName', 'departureDate', 'idleStartTime', 'idleStopTime'],
        datepickerOptions: {
            showDropdowns: true,
            autoUpdateInput: true,
            maxSpan: {"month":1},
            maxDate: this.$moment(),
        },
        texts:{
            filterBy: "Search by...",
        },
        orderBy: { ascending: false },
        sortable: ['departureDate', 'idleStartTime', 'idleStopTime', ],
        filterable: ['transporterName', 'plateNo', 'tiNo', 'departureName', 'departureDate', 'idleStartTime', 'idleStopTime'],
        headings: {
          transporterName: 'TRANSPORTER',
          plateNo: 'PLATE NO',
          tiNo: 'TI NO',
          departureName: 'DEPARTURE',
          departureDate: 'DEP DATE',
          idleStartTime: 'IDLE START TIME',
          idleStopTime: 'IDLE STOP TIME',
          diffTime: 'IDLE TIME'
        },
        headingsTooltips:{
          departureDate: 'Please click the below column to select the date range.',
          idleStartTime: 'Please click the below column to select the date range.',
          idleStopTime: 'Please click the below column to select the date range.',
		  	},
        requestAdapter: function(data) {
          return {
            ascending: data.ascending,
            byColumn: data.byColumn,
            pageSize: data.limit,
            orderBy: data.orderBy ? data.orderBy : "idleStopTime",
            page: data.page,
            query: data.query,
            pageResult: ((data.page-1)*data.limit)
          };
        },
        requestFunction: function (data) {
          return this.$axios.get('/api/report/idleReport', {
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
           idleStartTime: function(h,row) {
            if(row.idleStartTime == null || row.idleStartTime==''){
                return "";
              }else{
                return this.$moment(row.idleStartTime, 'YYYYMMDDHHmmss').format('DD MMM, YYYY HH:mm:ss');
            }
          },
           idleStopTime: function(h,row) {
              if(row.idleStopTime == null || row.idleStopTime==''){
                return "";
              }else{
                return this.$moment(row.idleStopTime, 'YYYYMMDDHHmmss').format('DD MMM, YYYY HH:mm:ss');
              }
          },
          diffTime: function(h,row){
                let hour = parseInt(row.diffTime/3600);
                let minute = parseInt((row.diffTime%3600)/60);
                let second = row.diffTime%60;

                if(hour.toString().length == 1){
                    hour = "0"+hour;
                }
                if(minute.toString().length == 1){
                    minute = "0"+minute;
                }
                if(second.toString().length == 1){
                    second = "0"+second;
                }
                return hour+":"+minute+":"+second;
          }
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

      if(filter.name == "vf__departureDate" || filter.name == "vf__idleStartTime" || filter.name == "vf__idleStopTime"){
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
      console.log(this.filter);
        this.$axios({
        method: 'post',
        url: '/api/report/idleReportForExcel',
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
        downloadjs(response.data,'Idle_Report.xlsx');
      }).catch((ex)=> {
        this.showErrorAlert(ex.response.status);
      }); 

    },
  },
}
</script>

