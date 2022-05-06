<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Delivery Distance Report</span>    
    </h4> 
    <Widget
      title="<h4></h4>"
      customHeader
      >
      <div class="widget-middle-overflow">
        <b-row>
          <b-col>
            <div class="export-button">
              <b-button
                variant="outline-default"
                @click="exportExcel()"
              >
                EXPORT EXCEL
              </b-button>
            </div>
          </b-col>
          <b-col>
            <div class="daterange">
              DRIVE DATE <input ref="daterange" id="daterangepicker" class="form-control" name="dates" />
            </div> 
          </b-col>
        </b-row>
            <v-server-table class="reportTableClass" ref="reportTable"  :columns="columns" :options="options" @sorted="setSorted" @filter="setFilter">
            </v-server-table>
        </div>
    </Widget>
  </div>
</template>

<script>
import Widget from '@/components/Widget/Widget';
import downloadjs from 'downloadjs';
export default {
  name: 'DeliveryDistanceReport',
  components: {
    Widget
  },
  created() {
    if(this.start == '' && this.end == '' ){
        this.start = this.$moment().subtract(8,'days');
        this.end = this.$moment().subtract(1,'days');
    };
  },
  data() {
    return {
      start:'',
      end: '',
      filter: [],
      sorted: {
        column: 'plateNo',
        ascending: 1
      },
      columns: [],
      tableData: [],
      options: {
        perPage:10,
        perPageValues:[10],
        skin: 'table table-striped',
        filterByColumn: true,
        sortable: ['transporterName' , 'plateNo', 'total'],
        filterable: ['transporterName' , 'plateNo', 'dayAndNight'],
        listColumns:{
          dayAndNight:[
            {
              id: 'D',
              text: 'DAY'
            },
            {
              id: 'N',
              text: 'NIGHT'
            }
          ]
        },
        texts:{
          filterBy: "Search by...",
          defaultOption: "ALL",
        },
        headings: {
          transporterName: 'TRANSPORTER',
          plateNo: 'PLATE NO',
          dayAndNight: 'DAY AND NIGHT',
          total: 'TOTAL (KM)'
        },
        requestAdapter: (data) => {
          const startDate =  this.$moment(this.start).format('YYYYMMDD');
          const endDate =  this.$moment(this.end).format('YYYYMMDD')
          return {
            ascending: data.ascending,
            byColumn: data.byColumn,
            pageSize: data.limit,
            orderBy: data.orderBy ? data.orderBy : "plateNo",
            page: data.page,
            query: data.query,
            pageResult: ((data.page-1)*data.limit),
            startDate: startDate,
            endDate: endDate
          };
        },
        requestFunction: function (data) {
          return this.$axios.get('/api/report/deliveryDistanceReport', {
                params: data
          }).catch(function (e) {
                this.dispatch('error', e);
          }.bind(this));
        },
        responseAdapter: (response) => {
          console.log(response);
          this.columns = response.data.resultBody.columns;
          return {
            data: response.data.resultBody.data,
            count: response.data.resultBody.count 
          }
        },
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

      this.filter.push({
        name: filter.name,
        value: filterValue
      });
    },
    exportExcel(){

        this.$axios({
        method: 'post',
        url: '/api/report/deliveryDistanceReportForExcel',
        params:{
          startDate: this.$moment(this.start).format('YYYYMMDD'),
          endDate: this.$moment(this.end).format('YYYYMMDD')
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
        downloadjs(response.data,'Delivery_Distance_Report.xlsx');
      }).catch((ex)=> {
        this.showErrorAlert(ex);
      }); 

    },
    init(start, end){
      this.start = this.$moment(start).format('YYYYMMDD');
      this.end = this.$moment(end).format('YYYYMMDD');
    },
    getReportData(){
      this.$refs.reportTable.getData();
    }
  },
    mounted(){
      let startDate = '';
      let endDate ='';

      const onDateSelected = (start, end) => {
        this.$emit('change', {
          startDate : start,
          endDate : end
        });
        this.init(start, end);
      };

      $(this.$refs.daterange).daterangepicker({
        startDate: this.$moment().subtract(8,'days'),
        endDate: this.$moment().subtract(1,'days'),
        minDate: this.$moment().subtract(1,'year'),
        maxDate: this.$moment(),
        maxSpan: {"month":1},
        locale: {
          format: 'DD MMM, YYYY'
        },
      }, function(start, end, label) {
          onDateSelected(start, end);
      });

      const fetchData = () =>{
        this.getReportData();
      }

      $(this.$refs.daterange).on('apply.daterangepicker', function(ev, picker) {
          fetchData();
       });
      
  },
}
</script>
