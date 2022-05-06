<template>
    <Widget title="<h5><i class='la la-bell'></i>&nbsp; Notifications </h5> 
       " customHeader>
        <ul class="status-list">
            <li v-for="row in notifications" :key="row.seqNo" class="list-group list-group-md">
                <a v-if="row.notiType === '1'" class="list-group-item">
                    <i class="fa fa-sign-in text-link mr-2" /> 
                    <span class="status-plateno">{{row.plateNo}} </span> &nbsp;
                    <span class="status-date">{{parseDate(row.notiTime)}}</span>
                </a>
                <a  v-if="row.notiType === '2'" class="list-group-item">
                    <i class="fa fa-sign-out text-gray-darker mr-2" /> 
                    <span class="status-plateno">{{row.plateNo}} </span> &nbsp;
                    <span class="status-date">{{parseDate(row.notiTime)}}</span>
                </a>
            </li>
        </ul>
    </Widget>
</template>

<script>
import Widget from '@/components/Widget/Widget';

export default {
    name: 'GeofenceStatus',
    components: {
        Widget
    },
    data() {
        return {
            notifications: [],
        };
    },
    created(){
        this.getDashboardNotification();
    },
    methods: {
        parseDate(date) {
            return this.$moment(date,'YYYYMMDDHHmmss').format('DD MMM, YYYY HH:mm:ss')
        },
        getDashboardNotification(){
             this.$axios.get('/api/dashboard/dashboardNoti')
            .then((response) => {
                console.log(response);
                const data = response.data.resultBody;
                this.notifications = data;
            }).catch((ex)=> {
                console.log(ex);
            })
        }
    },
}
</script>
