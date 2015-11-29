//--------------------------------------------------------------------------------
// Copyright 2015 Marcelo Costa Toyama
//
// This file is part of PixelnDice.
//
//    PixelnDice is free software: you can redistribute it and/or modify
//    it under the terms of the GNU Affero General Public License as published by
//    the Free Software Foundation, either version 3 of the License, or
//    any later version.
//
//    PixelnDice is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU Affero General Public License for more details.
//
//    You should have received a copy of the GNU Affero General Public License
//    along with PixelnDice.  If not, see <http://www.gnu.org/licenses/>.
//
//--------------------------------------------------------------------------------

var rpgImageLibrary = (function() {

  ///////////////////////////////////////////////////////////////////////
  return {
    ///////////////////////////////////////////////////////////////////////
    submitImage: function(){

      if( !rpgTable.validate( $("#upload-file").val() ) ){

        $("#label-upload-file").html("File input - <font color=\"red\">missing</font>");

      }else if( !rpgTable.validate( $("#upload-file-tags").val() ) ){

        $("#label-upload-file").html("File input");
        $("#label-upload-file-tags").html("TAGS - <font color=\"red\">missing</font>");
      }else{

        $("#label-upload-file").html("File input");
        $("#label-upload-file-tags").html("TAGS");

        // valid form
        var formData = new FormData();
        formData.append("tags", $("#upload-file-tags").val());
        formData.append("file", $("#upload-file")[0].files[0]);

        var path = $("#upload-file").val();
        var fileName = path.match(/[^\/\\]+$/);

        /*jshint multistr: true */
        var text= "<div id=\""+fileName+"\"> \
                                Uploading - "+fileName+" \
                                        <div class=\"progress progress-striped active\" id=\"file-1-uuid\"> \
                                        <div class=\"progress-bar\"  role=\"progressbar\" aria-valuenow=\"45\" aria-valuemin=\"0\" aria-valuemax=\"100\" style=\"width: 100%\"> \
          <span class=\"sr-only\">Running....</span> \
                                </div> \
                                </div> \
              </div> ";

        $("#progress-bar-file-upload").html( $("#progress-bar-file-upload").html() + text );

        $.ajax({
          url: "/api/image/upload",
          type: "POST",
          data: formData,
          processData: false,  // tell jQuery not to process the data
          contentType: false   // tell jQuery not to set contentType
        })
        .done(function(msg){

          console.log(msg.file);

          $(msg.file).remove();

          if( msg.ok ) {
            $("#upload-file-form")[0].reset();
            $("#upload-file-tags").tagsinput('removeAll');

            $("#label-upload-file").html("File input - <font color=\"green\">Done: "+msg.file+"</font>");

            rpgImageLibrary.library();

          }else{
            $("#label-upload-file").html("File input - <font color=\"red\">"+msg.err+"</font>");
          }

        })
        .fail( function( jqXHR, textStatus ) {
          console.log("Request failed: /api/image/upload: "+textStatus );
        });

      }

    },
    ///////////////////////////////////////////////////////////////////////
    modifyTAGS: function(ownerId,contentsha1,tags){

      $.ajax({
        type: "POST",
        url: "/api/image/updatetags",
        data: { ownerId: ownerId, contentsha1: contentsha1, tags: tags}
      })
      .done( function(msg){
        console.log(msg);
        rpgImageLibrary.library();
      })
      .fail( function( jqXHR, textStatus ) {
        console.log("Request failed: /api/image/updatetags: " + textStatus );
      });
    },

    ///////////////////////////////////////////////////////////////////////
    deleteImage: function(ownerId,contentsha1){
      $.ajax({
        type: "POST",
        url: "/api/image/delete",
        data: {ownerId:ownerId, contentsha1:contentsha1},
      })
      .done( function(msg){
        rpgImageLibrary.library();
      })
      .fail( function( jqXHR, textStatus ) {
        console.log("Request failed: /api/image/delete: " + textStatus );
      });

    },
    ///////////////////////////////////////////////////////////////////////
    library: function(){

      $.ajax({
        url: "/api/image/list",
        type: "POST",
        processData: false,  // tell jQuery not to process the data
        contentType: false   // tell jQuery not to set contentType
      })
      .done(function(msg){

        if( !msg.ok ){

          $("#my-library-div").html("<font color='red'>"+msg.err+"</font>");

        }else{

          rpgImageLibrary.display('#my-library-div','my-library-',msg.images);
        }

      })
      .fail( function( jqXHR, textStatus ) {
        console.log(" Request failed: /api/image/list: " + textStatus );
      });

    },

    ///////////////////////////////////////////////////////////////////////
    searchImage: function(){

      console.log("Searching image tags: "+$("#search-file-tags").val().toString());

      $.ajax({
        type: "POST",
        url: "/api/image/searchtags",
        data: {tags: $("#search-file-tags").val().toString()},
      }).done( function(msg){

        if( !msg.ok ){

          $("#search-file-results-div").html("<font color='red'>"+msg.err+"</font>");

        }else{

          if( jQuery.isEmptyObject(msg.images) ){
            $("#search-file-results-div").html("<font color='red'>No results</font>");
          }else{
            rpgImageLibrary.display("#search-file-results-div",'search-file-results-',msg.images);
          }
        }

      }).fail( function( jqXHR, textStatus ) {
        console.log("Request failed: /api/image/searchtags: " + textStatus );
      });


    },
    ///////////////////////////////////////////////////////////////////////
    display:function(divId,prefix,images){

      var col=0,maxCol=5;
      var row=0;

      var thumbnailWidth = 84;
      var thumbnailHeight = 84;

      var txt = "<table class='table table-bordered' style='table-layout: fixed;'>";

      txt = txt + "<form class='form'>";

      var dataTags = [];

      var closedTR = false;

      var idx = 0;

      for(idx=0; idx<images.length; ++idx){

        dataTags.push({ownerId: images[idx].ownerId, contentsha1: images[idx].contentsha1, tags: images[idx].tags});

        if( idx % maxCol === 0 ){

          closedTR = false;

          txt = txt + "<tr><td>";

        }else if( idx % maxCol === maxCol-1 ){

          txt = txt + "<td>";

          closedTR = true;

        }else{

          txt = txt + "<td>";

        }

        txt = txt + "<div style='overflow:hidden;'><i>"+images[idx].filename+"</i></div>";

        txt = txt + "<img src='/api/image/get?contentsha1="+images[idx].contentsha1+"&ownerId="+encodeURIComponent(images[idx].ownerId)+"&gmId="+rpgTable.get("gmId")+"' height='"+thumbnailHeight+"' width='"+thumbnailWidth+"'/>";

        txt = txt + "<div class='form-group'>";

        txt = txt + "<div id='"+prefix+"input-ownerId-"+images[idx].ownerId+"-contentsha1-"+images[idx].contentsha1+"'></div>";

        txt = txt + "<div><a href='javascript:rpgGm.addToWorld(\"/api/image/get?contentsha1="+images[idx].contentsha1+"&ownerId="+encodeURIComponent(images[idx].ownerId)+"&gmId="+rpgTable.get("gmId")+"\")'><font color='green'><span class='glyphicon glyphicon-plus' aria-hidden='true'></span>to map</font></a></div>";

        txt = txt + "<div><a href='javascript:rpgImageLibrary.deleteImage(\""+images[idx].ownerId+"\",\""+images[idx].contentsha1+"\")'><font color='red'><span class='glyphicon glyphicon-remove' aria-hidden='true'>Delete</span></font></a></div>";

        txt = txt + "</div>";

        if( idx % maxCol === 0 ){

          txt = txt + "</td>";

        }else if( idx % maxCol === maxCol-1 ){

          txt = txt + "</td></tr>";

        }else{

          txt = txt + "</td>";

        }

      }

      if( !closedTR )
        txt = txt + "</tr>";

      txt = txt + "</form>";
      txt = txt + "</table>";

      $(divId).html( txt );

      for(idx=0; idx<dataTags.length; ++idx){

        // setting tags input
        $(prefix+"input-ownerId-"+dataTags[idx].ownerId+"-contentsha1-"+dataTags[idx].contentsha1).tagsinput({
          trimValue: true
        });

        // adding tags pre existing tags
        var tagsTMP = dataTags[idx].tags.split(",");

        for(var j=0; j<tagsTMP.length; ++j){
          $(prefix+"input-ownerId-"+dataTags[idx].ownerId+"-contentsha1-"+dataTags[idx].contentsha1).tagsinput('add',tagsTMP[j]);
        }

        // adding tag
        (function(ownerId,contentsha1){

          $(prefix+"input-ownerId-"+ownerId+"-contentsha1-"+contentsha1).on('itemAdded', function(event) {

            rpgImageLibrary.modifyTAGS(ownerId,contentsha1,$(prefix+"input-ownerId-"+ownerId+"-contentsha1-"+contentsha1).val().toString());
          });

        })(dataTags[idx].ownerId,dataTags[idx].contentsha1);

        // deleting tag
        (function(ownerId,contentsha1){

          $(prefix+"input-ownerId-"+ownerId+"-contentsha1-"+contentsha1).on('itemRemoved', function(event) {

            rpgImageLibrary.modifyTAGS(ownerId,contentsha1,$(prefix+"input-ownerId-"+ownerId+"-contentsha1-"+contentsha1).val().toString());

          });

        })(dataTags[idx].ownerId,dataTags[idx].contentsha1);

      }
    },
    ///////////////////////////////////////////////////////////////////////
  };
}());
