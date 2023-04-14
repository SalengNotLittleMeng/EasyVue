class Vue{
    constructor(options){
        this.$options=options
        this.$el=document.querySelector(options.el)
        this.$template=this.$el.innerHTML
        this.initMethods()
        this.dispatchLifeCiryle('beforeCreated')
        this.initData()
        this.dispatchLifeCiryle('created')
        this.patch()
        this.dispatchLifeCiryle('mounted')
    }
    initData(){
        const vm=this
        if(typeof vm.$options.data=='function'){
            this.$data=this.$options.data()
        }else{
            this.$data=this.$options.data
        }
        Object.keys(this.$data).forEach(data=>{
            Object.defineProperty(vm,data,{
                get(){
                   return vm['$data'][data]
                },
                set(newValue){
                    vm['$data'][data]=newValue
                    vm.patch()
                }
            })
        })
    }
    dispatchLifeCiryle(name){
        const fun=this.$options[name]
        if(fun){
            fun.call(this)
        }
    }
    initMethods(){
        const methods=this.$options.methods || {}
        const vm=this
        Object.keys(methods).forEach(method=>{
            if(typeof methods[method] === 'function'){
                methods[method].bind(vm)
                Object.defineProperty(vm,method,{
                    get(){
                       return methods[method]
                    }
                })
            }
        })
    }
    patch(){
        const getAllBracketConetent=/\{\{([0-1a-zA-Z]+)\}\}/g
        const resultList=this.$template.replaceAll(getAllBracketConetent,(current)=>{
            const key=current.slice(2,-2)
            return this.$data[key]
        })
        this.dispatchLifeCiryle('beforeUpdated')
        this.$el.innerHTML=resultList
        this.dispatchLifeCiryle('updated')
    }
}