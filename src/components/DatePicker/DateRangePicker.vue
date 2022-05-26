<template lang="en">
<DatePicker lang="en" v-model="dateRange" :format="datepicketFormat" range input-class="form-control" width="220">
    <i class="glyphicon glyphicon-glyph-calendar" slot="calendar-icon" />
</DatePicker>
</template>

<script>
import DatePicker from 'vue2-datepicker';
export default {
    components: {
        DatePicker,
    },
    watch: {
        dateRange(date) {
            const notBeforeDate = this.subtractMonth(date[1]);
            this.notBefore = this.parseDate(notBeforeDate);

            if (date[0] < notBeforeDate) {
                this.datepickerText[0] = notBeforeDate;
            }
            this.$emit('dateChange', this.dateRange);
        }
    },
    methods: {
        subtractMonth(date) {
            return this.$moment(date, 'YYYYMMDDHHmmss').subtract(1, 'month').toDate();
        },
        parseDate(date) {
            return this.$moment(date, 'YYYYMMDDHHmmss').format('DD MMM, YYYY')
        },
    },
    data() {
        return {
            dateRange: [new Date(), new Date()],
            datepicketFormat: 'DD MMM, YYYY',
            notBefore: this.subtractMonth(new Date()),
        }
    }
}
</script>

<style lang="scss">
$background: rgba($color: #ffffff, $alpha: 0.2);

.mx-datepicker-range {input {
    background-color: $background;
    color: #ffffff;}
    .glyphicon-glyph-calendar{
        color: #ffffff;
    }
}
</style>
