<template>

    <Widget title="<h5> <i class='la la-lightbulb-o'></i>&nbsp; GPS Provider<span class='fw-semi-bold'> Status</span> </h5>" customHeader>
        <br>
        <div class="table-resposive">    
            <table class="table table-bordered">    
                <thead>    
                    <tr>    
                        <th class="provider_header" v-for="row in providerStatus" :key="row.crawerId">{{row.crawlerId}}</th>      
                    </tr>    
                </thead>
    
                <tbody>    
                    <tr>    
                        <td class="table-badge" v-for="row in providerStatus" :key="row.crawerId">    
                            <b-badge v-if="row.operationStatusCode === 'S'" variant="primary" class="status_badge">Normal</b-badge>    
                            <b-badge v-if="row.operationStatusCode === 'F'" variant="danger" class="status_badge">Error</b-badge>
                            <b-badge v-if="row.operationStatusCode === 'N'" variant="warning" class="status_badge">Not Used</b-badge>    
                        </td>    
                    </tr>
                </tbody>    
            </table>    
        </div>    
    </Widget>
</template>
<script>
import Widget from '@/components/Widget/Widget';

export default {
  name: 'GpsProviderStatus',
    components: { 
      Widget
    },
    data() {
        return {
            providerStatus: [],
        }
    },
    created(){
        this.getProviderStatus();
    },
    methods: {
        getProviderStatus(){
             this.$axios.get('/api/dashboard/providerStatus')
            .then((response) => {
                console.log(response);
                const data = response.data.resultBody;
                this.providerStatus = data;
                console.log(data);
                console.log(JSON.stringify(this.providerStatus));
            }).catch((ex)=> {
                console.log(ex);
            })
        }
    },


}
</script>
