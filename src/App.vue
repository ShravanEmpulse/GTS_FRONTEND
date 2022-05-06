<template>
  <router-view />
</template>

<script>
export default {
  name: 'App',
  created() {
    const currentPath = this.$router.history.current.path;
    
    if ( ! window.sessionStorage.getItem('Dorothy-Auth-Token') ) {

      if(currentPath=='/resetPassword'){
        this.$router.push('/resetPassword');
      }else{
        this.$router.push('/login');
      }

    }
  },
};
</script>

<style src="./styles/theme.scss" lang="scss" />
