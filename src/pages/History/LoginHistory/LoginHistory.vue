<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Login History</span>    
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

            <v-server-table  class="historyTableClass" ref="historyTable" :columns="columns" :options="options" 
            @sorted="setSorted" @filter="setFilter" @loading="onLoading" @loaded="onLoaded">
            </v-server-table>
        </div>

        <loading
          :show="loadingShow"
          :label="loadingLabel"
          loader-class="loading">
        </loading>
    </Widget>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import downloadjs from 'downloadjs';
export default {
    name: 'LoginHistory',
    components: {
      Widget
    },
    data() {
      return {
        /* LOADING */
        loadingShow: false,
        loadingLabel: 'Loading...',

        filter: [],
        sorted: {
          column: 'accessTime',
          ascending: 0
        },
        columns: ['companyName','userId', 'accessTime'],
        tableData: [],
        options: {
          perPage:10,
          perPageValues:[10],
          skin: 'table table-striped',
          filterByColumn: true,
          dateColumns:['accessTime'],
          dateFormat: 'DD MMM, YYYY',
          toMomentFormat: 'YYYYMMDDHHmmss',
          datepickerOptions: {
              showDropdowns: true,
              autoUpdateInput: false,
              maxSpan: {"month":1},
              maxDate: this.$moment(),
          },
          debounce:1000,
          headings: {
            companyName: 'COMPANY',
            userId: 'USER ID',
            accessTime: 'ACCESS TIME'
          },
          sortable: ['userId', 'accessTime'],
          orderBy: { ascending: false },
          texts:{
            filterBy: "Search by...",
          },
          requestAdapter: function(data) {
              return {
                ascending: data.ascending,
                byColumn: data.byColumn,
                pageSize: data.limit,
                orderBy: data.orderBy ? data.orderBy : "accessTime",
                page: data.page,
                query: data.query,
                pageResult: ((data.page-1)*data.limit)
              };
          },
          requestFunction: function (data) {
            return this.$axios.get('/api/history/loginHistory', {
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
            accessTime: function(h,row) {
                return this.$moment(row.accessTime).format('DD MMM, YYYY HH:mm:ss');
            },
          }
        }
      }
    },
    mounted(){
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

        if(filter.name == "vf__accessTime"){
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
          url: '/api/history/loginHistoryForExcel',
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
          downloadjs(response.data,'Login_History.xlsx');
        }).catch((ex)=> {
          this.showErrorAlert(ex.response.status);
        }); 
      },
      onLoading(){
        this.loadingShow = true;
      },
      onLoaded(){
        this.loadingShow = false;
      }
    },

}
</script>

<style src="../History.scss" lang="scss" />

