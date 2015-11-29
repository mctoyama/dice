
var json = JSON.stringify({width:100,
			   height:200,
			   init:function(){console.log("hello world");},toJSON: function(){
			     this.init = null;
			     return( this );
			   },
			   myArray: [{name:"Marcelo",func:function(){console.log("Marcelo")},toJSON: function(){this.func=null; return(this);}},
				     {name:"Toyama",func:function(){console.log("Toyama")},toJSON: function(){this.func=null; return(this);}}],
});

console.log(json);

var tk = JSON.parse(json,function(k,v){

  if( k==='' )
    return(v);
  else if( k==="init" )
  return( function(){
    console.log("hello world");
  });
  else if( k==="width")
  return(v);
  else if( k==="height")
  return(v);
  else if( k==="myArray")
  return(v);
  else if( k==="name")
  return(v);
  else if( k==="func")
  return( function(){ console.log(this.name) } );
  else if( !isNaN(k) )
  return(v);
  else{
    console.log(k+" "+v);
    }

});

tk.init();

console.log(tk.myArray);

tk.myArray[0].func();
//console.log(tk);
