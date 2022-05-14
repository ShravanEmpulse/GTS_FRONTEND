<template>
  <div class="dynamic-tables">
    <h4 class="page-title">    
      <span>Train</span>    
    </h4> 
    <Widget
      title="<h4></h4>"
      customHeader
      >
      <div class="widget-middle-overflow">

        <div class="export-button">
          <download-excel
            class   = "btn btn-outline-default"
            :data   = "exportData"
            worksheet = "Train"
            type    = "csv"
            :fields ="excel_fields"
            name    = "Train.csv">
            EXPORT EXCEL
          </download-excel>
        </div>

        <v-client-table class="trainTableClass" ref="trainTable" :data="tableData" :columns="trainColumns" :options="trainOptions">
          <b-button slot="status" slot-scope="props" :variant="props.row.status[0].type" class="train-status-badge" @click="getTrainDetail(props.row)" v-b-modal.detail >{{props.row.status[0].title}}</b-button>
          <a class="item-count" slot="item" slot-scope="props"  >{{props.row.item}}</a>
          <p slot="location" slot-scope="props" >{{getLocation(props.row.location)}}</p>
        </v-client-table>
      </div>
    </Widget>
    <b-modal id="detail" size="lg" title="Train Detail" body-class="bg-white" hide-footer>
      <div class="trainDetail">
        <br>
      <header>
          <b-row>
            <b-col md="6" xs="12" class="b-col-print-6">
              <h5>
              <span class="fw-semi-bold">{{trainInfo.ti_no}}</span>  
              </h5>
            </b-col>
          </b-row>
      </header>
      <br>
      <section>
          <b-row class="mb-lg">
              <b-col sm='12' class="b-col-print-12">
                <h5 class="no-margin">Glovis</h5>
                <h3 class="company-name m-t-1 fw-semi-bold">
                    {{trainInfo.departure}}
                </h3>
                <address>
                    PLATE NO: <strong>{{trainInfo.plate_no}}</strong><br />
                    TI No: <strong>{{trainInfo.ti_no}}</strong><br />
                    DEPARTURE DATE:<strong> {{trainInfo.departure_date}}</strong><br />
                    LOCATION:<strong> {{getLocation(trainInfo.location)}}</strong><br />
                </address>
            </b-col>
          </b-row>
        </section>
      </div>
        <div class="invoice">
          <table class="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>DESTINATION</th>
                  <th>DEALER</th>
                   <th>ETA</th>
                  <th>{{this.itmeNo}}</th>
                  <th class="hidden-sm-down">MODEL NAME</th>
                </tr>
              </thead>
              <tbody>
                <tr  v-for="( row, index ) in invoiceDetail" :key="index">
                  <td v-if="row.goodsCode == 'V'"><i class="fa fa-car"/></td>
                  <td v-if="row.goodsCode == 'P'"><i class="fa fa-gear"/></td>
                  <td>{{row.destName}}</td>
                  <td>{{row.dealerName}}</td>
                  <td>{{parseDateforETA(row.eta)}}</td>
                  <td>{{row.itemNo}}</td>
                  <td>{{row.itemName}}</td>
                </tr>
              </tbody>
           </table>
        </div>
    </b-modal>

    <loading
      :show="loadingShow"
      :label="loadingLabel"
      loader-class="loading">
    </loading>
  
  </div>
</template>
<script>
import Widget from '@/components/Widget/Widget';

export default {
  name: 'Train',
  components: { Widget },
  data() {
    return {
      /* LOADING */
      loadingShow: false,
      loadingLabel: 'Loading...',
      tableData: [],
      status:[],
      trainColumns: [ 'plate_no','ti_no','departure_date', 'eta', 'destination' , 'location', 'status' ],
      trainOptions: {
        filterByColumn: true,
        perPage: 10,
        perPageValues: [],
        pagination: { chunk: 5, dropdown: false },
        orderBy:{ ascending:true},
        skin: 'table table-striped',
        filterable: ['plate_no','ti_no','departure_date', 'eta', 'destination', 'location', 'status'],
        texts:{
            filterBy: "Search by...",
            defaultOption: "ALL",
        },
      },
      invoiceDetail: [],
      trainInfo: [],
      excel_fields: {
        'STATUS': {
          field:'status',
          callback:(value)=>{
            return value[0].title;
          }
        },
        'PLATE NO': 'plate_no',
        'TI NO': 'ti_no',
        'DEPARTURE DATE': 'departure_date',
        'DEPARTURE': 'departure',
        'ETA': 'eta', 
        'DESTINATION': 'destination',
        'LOCATION': {
          field:'location',
          callback:(value)=>{
            if(!value){
              return "-"
            }else{
              return value
            }
          }
        },
      },
      itmeNo: 'ITEM NO',
    };
  },
  created() {
    this.getTrainInfo(); 
  },
  mounted(){
     if(this.$route.params.status){
       this.setFilter(this.$route.params.status);
     }
  },
  computed: {
    exportData(){
      if(typeof this.$refs.trainTable !== 'undefined'){
        return this.$refs.trainTable.allFilteredData;
      }else{
        return this.tableData;
      }
    }
  },
  methods: {
    parseDateforETA(date) {
        return  this.$moment(date,'YYYYMMDD').format('DD MMM, YYYY');
    },
    parseDateforDepDate(date) {
        return  this.$moment(date,'YYYYMMDDHHmmss').format('DD MMM, YYYY');
    },
    getTrainInfo(){
      this.tableData = [];
      this.loadingShow = true;
      this.$axios.get('/api/train/trainInfo')
      .then((response) => {
        this.loadingShow = false;
        const data = response.data.resultBody;

        for(let i in data){

          if(data[i].destCount==1){
            this.tableData.push({
              status: this.settingStatus(data[i].drivingStatus),
              plate_no: data[i].plateNo,
              ti_no: data[i].tiNo,
              departure_date: data[i].departureDate,
              departure: data[i].departureName,
              eta: data[i].eta,
              destination: data[i].destName,
              shippingId: data[i].shippingId,
              location: data[i].location
            })
          }else{
            this.tableData.push({
              status: this.settingStatus(data[i].drivingStatus),
              transporter_name: data[i].transporterName,
              plate_no: data[i].plateNo,
              ti_no: data[i].tiNo,
              departure_date: data[i].departureDate,
              departure: data[i].departureName,
              eta: data[i].eta,
              destination: data[i].destName+' and '+(data[i].destCount-1),
              shippingId: data[i].shippingId,
              location: data[i].location
            })
          }
        }
      })
      .catch(()=> {
        this.loadingShow = false;
      })
    },
    settingStatus(drivingStatus){

      this.status=[];

      if(drivingStatus == '0'){
          this.status.push({
            type: 'default',
            title: 'NONE'
          })
      }else if(drivingStatus == '1'){
          this.status.push({
            type: 'primary',
            title: 'TRANSIT'
          })
      }else if(drivingStatus == '2'){
          this.status.push({
            type: 'success',
            title: 'ARRIVAL'
          })
      }else if(drivingStatus == '3'){
          this.status.push({
            type: 'info',
            title: 'IDLE'
          })
      }
      else if(drivingStatus == '4'){
          this.status.push({
            type: 'danger',
            title: 'DELAY'
          })
      }
      else if(drivingStatus == '5'){
          this.status.push({
            type: 'warning',
            title: 'STANDBY'
          })
      }
      return this.status;
    },
    getTrainDetail(trainInfo){
      this.loadingShow = true;
      this.$axios.get('/api/train/invoiceDetail', {
          params: { plateNo: trainInfo.plate_no, shippingId: trainInfo.shippingId }
      })
      .then((response) => {
        this.loadingShow = false;
        this.trainInfo = trainInfo;
        this.invoiceDetail = response.data.resultBody;

        if(this.invoiceDetail[0].goodsCode == 'V'){
          this.itmeNo = "VIN";
        }else if(this.invoiceDetail[0].goodsCode == 'P'){
          this.itmeNo = "ITEM NO";
        }
      })
      .catch(()=> {
        this.loadingShow = false;
      }) 
    },
    setFilter(paramStatus){
      this.$refs.trainTable.setFilter({
        status: paramStatus
      });
    },
    getLocation(location){
     if(!location){
       return '-'
     }else{
       return location
     }
    }
  }
};
</script>
<style src="./Train.scss" lang="scss" />
