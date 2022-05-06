<template>
    <div>
       <b-form @submit="onSubmit">
            <fieldset>
                <b-form-group
                    horizontal
                    label="Container No"
                    :label-cols="3"
                    label-breakpoint="md"
                    label-for="containerNo"
                >
                    <input
                        name="containerNo"
                        :class="{ 'form-control': true }"
                        type="text"
                        id="containerNo"
                        v-model="containerTrailer.containerNo"
                        readonly
                    />
                </b-form-group>
                <b-form-group
                    horizontal
                    label="Plate No"
                    :label-cols="3"
                    label-breakpoint="md"
                    label-for="plateNo"
                >
                    <input
                        name="plateNo"
                        :class="{ 'form-control': true }"
                        type="text"
                        id="plateNo"
                        v-model="containerTrailer.plateNo"
                        readonly
                    />
                </b-form-group>
                <b-form-group
                    label="GPS Provider"
                    label-for="gpsProvider"
                    :label-cols="3"
                >
                    <v-select
                        v-validate="{ required: true }"
                        id="gpsProvider"
                        name="gpsProvider"
                        v-model="containerTrailer.gpsProviderCode"
                        :options="gpsProvider_search_options"
                        data-vv-as="GPS Provider"
                        index="value" 
                        label="label" 
                    />
                    <span class="text-danger" v-if="errors.has('gpsProvider')">
                      {{errors.first('gpsProvider')}}
                    </span>
                </b-form-group>
            </fieldset>
            <hr>
            <b-row>
                <b-col lg ="12"> 
                  <b-button type="submit" variant="primary" class="mb-xs mr-xs float-right" :disabled="this.errors.any()">Save</b-button>
                </b-col>
            </b-row>
        </b-form>
    </div>
</template>
    
<script>
import vSelect from 'vue-select';

export default {
  name: 'EditTrailer',
  components: {
    vSelect
  },
  data() {
    return {
        plateNo: '',
        containerNo: '',
        gpsProviderList: [],
        gpsProvider_search_options: [],
        isDisabled: false,
        containerTrailer: [], 
        changeSuccessMessage: 'Changed Successfully!'
    };
  },
  watch: {
  },
  created(){
    this.getGenisysProvider();
  },
  methods: {
    showErrorAlert(status) {
      this.$swal({
          title: 'Error',
          text: status,
          confirmButtonText: 'OK'
      });
    },
    showSuccessrAlert(successMessage) {
      this.$swal({
          title: 'Success',
          text: successMessage,
          confirmButtonText: 'OK'
      }).then(() => {
        window.location.reload();
      });
    },
    onSubmit(e){
      e.preventDefault();
          
      this.$validator.validateAll()
      .then((response) =>{
        if(!response){
            this.showErrorAlert('Please Check the validation!');
        }else{
            this.updateGenisysTrailer();
        }
      })
      .catch((ex)=>{
          this.showErrorAlert(ex.response.status);
      });

    },
    getGenisysProvider(){
        this.$axios.get('/api/genisysTrailer/gpsProviderList')
        .then((response) => {
          console.log(response);
          this.gpsProviderList = response.data.resultBody;
            for(let i in this.gpsProviderList){
              this.gpsProvider_search_options.push({
                value: this.gpsProviderList[i].gpsProviderCode,
                label: this.gpsProviderList[i].gpsProviderName
              })
          }
        })
        .catch((ex)=> {
            console.log(ex);
        }) 
    },
    updateGenisysTrailer(){
      this.isDisabled=true;
      const updateGenisysTrailerUrl = '/api/genisysTrailer/updateGpsProvider/${containerNo}';

      this.$axios.put(updateGenisysTrailerUrl.replace("${containerNo}", this.containerTrailer.containerNo), { 
          plateNo: this.containerTrailer.plateNo, containerNo: this.containerTrailer.containerNo, gpsProviderCode: this.containerTrailer.gpsProviderCode })
      .then((response) => {
          console.log(response);
          const updateResult = response.data.resultCode;
          if(updateResult=='200'){
              this.showSuccessrAlert(this.changeSuccessMessage);
              this.isDisabled = false;
          }else if(updateResult=='300'){
              this.showErrorAlert(updateResult);
              this.isDisabled = false;
          }else{
              this.showErrorAlert(response.data.resultMessage);
              this.isDisabled = false;
          }
      })
      .catch((ex)=>{
          console.log(ex);
          this.showErrorAlert(ex.response.status);
      }) 

    },

    
  }
}
</script>
