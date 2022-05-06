<template>
  <div class="error-page">
    <b-container>
      <div class="errorContainer mx-auto">
        <h1 class="errorCode">404</h1>
        <p class="errorInfo">
            Oops, it seems this page does not exist.
        </p>
        <p class="errorHelp mb-3">
          We could not find the page you were looking for.
        </p>
      </div>
      <footer class="pageFooter">
         &copy; GLOVIS. All rights reserved.
      </footer>
    </b-container>
  </div>
</template>

<script>
export default {
  name: 'ErrorPage',
};
</script>

<style src="./Error.scss" lang="scss" scoped />
