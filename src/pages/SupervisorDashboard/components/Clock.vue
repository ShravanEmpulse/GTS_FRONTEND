<template>
  <div>
        <div id="clock">
            <p class="date">{{ date }}</p>
            <p class="time">{{ time }}</p>
        </div>
  </div>
</template>

<script>

export default {
  name: 'Clock',
  data() {
      return {
            clock:null,
            date:'',
            time:'',
        }
          
  },
  mounted() {
        this.updateTime();
  },
  created(){
        this.setTime();
   },
   beforeDestroy(){
        clearInterval(this.clock);
    },
    methods: {
        updateTime(){
            let now = new Date();
            this.date = this.$moment(now,'YYYYMMDDHHmmss').format('MMM D, YYYY');
            this.time = this.$moment(now,'YYYYMMDDHHmmss').format('HH:mm');
        },
        setTime(){
            this.clock =  setInterval(()=>{
                this.updateTime();
            },1000);
        },
    
    }

}
</script>

<style src="./Clock.scss" lang="scss" />
