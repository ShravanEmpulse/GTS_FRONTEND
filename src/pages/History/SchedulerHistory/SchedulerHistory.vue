<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Scheduler History</span>    
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
          <v-server-table  class="historyTableClass" ref="historyTable" :columns="columns" :options="options" @sorted="setSorted" @filter="setFilter">
          </v-server-table>
        </div>
    </Widget>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import downloadjs from 'downloadjs';
export default {
  name: 'SchedulerHistory',
  components: {
    Widget
  },
  data() {
    return {
      filter: [],
      sorted: {
        column: 'executeDateTime',
        ascending: 0
      },
      columns: ['schedulerName', 'exception', 'executeDateTime', 'totalCount', 'processingCount', 'errorCount', 'elapsedTime'],
      options: {
        perPage:10,
        perPageValues:[10],
        skin: 'table table-striped',
        filterByColumn: true,
        dateColumns:['executeDateTime'],
        dateFormat: 'DD MMM, YYYY',
        toMomentFormat: 'YYYYMMDDHHmmss',
        datepickerOptions: {
            showDropdowns: true,
            autoUpdateInput: true,
            maxSpan: {"month":1},
            maxDate: this.$moment(),
        },
        filterable: ['schedulerName', 'exception', 'executeDateTime', 'totalCount', 'processingCount', 'errorCount', 'elapsedTime'],
        headings: {
          schedulerName: 'SCHEDULER NAME',
          exception: 'EXCEPTION',
          executeDateTime: 'EXECUTE DATETIME',
          totalCount: 'TOTAL COUNT',
          processingCount: 'PROCESSING COUNT',
          errorCount: 'ERROR COUNT',
          elapsedTime: 'ELAPSED TIME'
        },
        texts:{
            filterBy: "Search by...",
        },
        orderBy: { ascending: false },
        requestAdapter: function(data) {
          return {
            ascending: data.ascending,
            byColumn: data.byColumn,
            pageSize: data.limit,
            orderBy: data.orderBy ? data.orderBy : "executeDateTime",
            page: data.page,
            query: data.query,
            pageResult: ((data.page-1)*data.limit)
          };
        },
        requestFunction: function (data) {
          return this.$axios.get('/api/history/schedulerHistory', {
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
          executeDateTime: function(h,row) {
              return this.$moment(row.executeDateTime, 'YYYYMMDDHHmmss').format('DD MMM, YYYY HH:mm:ss');
          },
          elapsedTime: function(h,row){
            let elapsedTimeToSecond = row.elapsedTime/1000;
            return elapsedTimeToSecond;
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

      if(filter.name == "vf__executeDateTime"){
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
        url: '/api/history/schedulerHistoryForExcel',
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
        downloadjs(response.data,'Scheduler_History.xlsx');
      }).catch((ex)=> {
        this.showErrorAlert(ex.response.status);
      }); 

    },
  },
}
</script>
