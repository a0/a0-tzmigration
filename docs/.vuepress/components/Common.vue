<script>
export default {
  methods: {
    offset_to_str(offset) {
      let date = new Date(null)
      let off = offset < 0 ? -offset : offset
      let pre = offset < 0 ? '-' : '+'
    
      date.setTime(off*1000)
    
      return pre + date.toISOString().substr(11, 8)
    }
  }
}
</script>
