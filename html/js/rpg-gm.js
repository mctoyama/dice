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

var rpgGm = (function(){

  return {

    ///////////////////////////////////////////////////////////////////////
    init:function(){

      if( rpgTable.amIGM() ){

        if( !rpgShell.ready() ){

          setTimeout(rpgGm.init,3000);

        }else{

          $.ajax({
            type: "POST",
            url: "/api/map/list",
          }).done(function(msg){

            // campaign withou maps - creating default one
            if( jQuery.isEmptyObject( msg ) ){
              rpgGm.createMap("Unnamed map");
              rpgGm.init();
            }else{
              rpgTable.set("gmMapId",msg[0].mapId);
              rpgTable.set("playersMapId",msg[0].mapId);
              rpgGm.loadGmMap(msg[0].mapId);
            }

          }).fail( function( jqXHR, textStatus ) {
            console.log(" Request failed: /api/map/list: " + textStatus );
          });

        }
      }

    },
    ///////////////////////////////////////////////////////////////////////
    listMap: function(){

      $.ajax({
        type: "POST",
        url: "/api/map/list",
      }).done( function(msg){

        $("#my-maps-table").html("<tr><td>Players <span class='glyphicon glyphicon-flag' aria-hidden='true'></span></a></td><td>Map name</td><td>Rename</td><td>Delete</td></tr>");

        // campaign withou maps - creating default one
        if( jQuery.isEmptyObject( msg ) ){
          rpgGm.createMap("Unnamed map");
        }

        for(var idx=0; idx<msg.length; ++idx){

          var txt = "<tr id='map-row-"+msg[idx].mapId+"'><td><input type='radio' name='mapId' value='"+msg[idx].mapId+"'><span id='flag-"+msg[idx].mapId+"' class='glyphicon glyphicon-flag radio-flag' aria-hidden='true' style='display:none'></span></td><td id='map-id-name-"+msg[idx].mapId+"'><a href='javascript:rpgGm.loadGmMap("+msg[idx].mapId+");'><span class='glyphicon glyphicon-play'>"+msg[idx].name+"</span></a></td><td><a href='javascript:rpgGm.renameMapUI("+msg[idx].mapId+")'><span class='glyphicon glyphicon-pencil'></span></a></td><td><a href='javascript:rpgGm.deleteMap("+msg[idx].mapId+");'><span class='glyphicon glyphicon-remove'></span></a></td></tr>";

          $("#my-maps-table").append(txt);
        }

        // init radio button form maps
        $("input[name=mapId]","#my-maps-form").click( function() {rpgGm.loadPlayersMap($('input[name=mapId]:checked', "#my-maps-form").val());} );

        // show flag for player map
        $("#flag-"+rpgTable.get("playersMapId")).show();

      }).fail( function( jqXHR, textStatus ) {
        console.log(" Request failed: /api/map/list: " + textStatus );
      });

    },
    ///////////////////////////////////////////////////////////////////////
    createMap: function(mapName){

      var name = "";

      if( rpgTable.validate(mapName) )
        name = mapName;
      else
        name = $("#inputMapName").val();

      if( !rpgTable.validate(name) ){
        console.log("invalid map name");
      }else{

        var tmp = new rpgWorld.create();

        $.ajax({
          type: "POST",
          url: "/api/map/create",
          data: { name:name, json:JSON.stringify(tmp) }
        }).done( function(msg){

          if( msg.ok ){

            var txt = "<tr id='map-row-"+msg.mapId+"'><td><input type='radio' name='mapId' value='"+msg.mapId+"'><span id='flag-"+msg.mapId+"' class='glyphicon glyphicon-flag radio-flag' aria-hidden='true' style='display:none'></span></td><td><a href='javascript:rpgGm.loadGmMap("+msg.mapId+");'><span class='glyphicon glyphicon-play'>"+name+"</span></a></td><td><a href='javascript:rpgGm.renameMapUI("+msg.mapId+")'><span class='glyphicon glyphicon-pencil'></span></a></td><td><a href='javascript:rpgGm.deleteMap("+msg.mapdId+");'><span class='glyphicon glyphicon-remove'></span></a></td></tr>";

            $("#my-maps-table").append(txt);

            // init radio button form maps
            $("input[name=mapId][value="+msg.mapId+"]","#my-maps-form").click( function() {rpgGm.loadPlayersMap($('input[name=mapId]:checked', "#my-maps-form").val());} );


          }else{
            console.log("Error creating map - "+msg.err);
          }

        }).fail( function( jqXHR, textStatus ) {
          console.log(" Request failed: /api/map/create: " + textStatus );
        });

      }

      $("#inputMapName").val(undefined);

    },
    ///////////////////////////////////////////////////////////////////////
    renameMapUI:function(mapId){

      var oldName = $("#map-id-name-"+mapId).text();

      $("#map-id-name-"+mapId).html("<input type='text' name='new-map-name'>");

      $("input[name=new-map-name]").on("keydown",function search(e) {
        if(e.keyCode == 13) {
          rpgGm.renameMap(mapId,$("input[name=new-map-name]").val());
          e.preventDefault();
        }
      });

    },
    ///////////////////////////////////////////////////////////////////////
    renameMap: function(mapId,name){

      $.ajax({
        type: "POST",
        url: "/api/map/rename",
        data: { mapId:mapId, name:name }
      }).done(function(msg){

        $("#map-id-name-"+mapId).html("<td id='map-id-name-"+mapId+"'>"+name+"</td>");

      }).fail(function(msg){
        console.log(" Request failed: /api/map/rename: " + textStatus );
      });

    },
    ///////////////////////////////////////////////////////////////////////
    loadGmMap: function(mapId){

      rpgTable.set("gmMapId",mapId);

      if( rpgTable.get("gmMapId") === rpgTable.get("playersMapId") ){
        rpgGm.loadPlayersMap(mapId);
      }else{

        $.ajax({
          type: "POST",
          url: "/api/map/load",
          data: { mapId:mapId }
        }).done( function(msg){

          if( rpgTable.validate(msg.mapId) ){

            rpgWorld.setJSON(msg.mapId,msg.json);
            rpgWorld.setMapId(msg.mapId);
            rpgWorld.load();
            rpgTable.set("gmMapId",msg.mapId);

          }else{
            console.log("Error loading map - "+msg.err);
          }

        }).fail( function( jqXHR, textStatus ) {
          console.log(" Request failed: /api/map/load: " + textStatus );
        });
      }

      rpgTable.displayPage("canvas");
    },
    ///////////////////////////////////////////////////////////////////////
    loadPlayersMap: function(mapId){

      rpgTable.set("playersMapId",mapId);

      $(".radio-flag").hide();

      $("#flag-"+$('input[name=mapId]:checked', "#my-maps-form").val()).show();

      $.ajax({
        type: "POST",
        url: "/api/map/load",
        data: { mapId:mapId }
      }).done( function(msg){

        if( rpgTable.validate(msg.mapId) ){

          rpgShell.loadPlayersMap(msg.mapId,msg.name,msg.json);

        }else{
          console.log("Error loading map - "+msg.err);
        }

      }).fail( function( jqXHR, textStatus ) {
        console.log(" Request failed: /api/map/load: " + textStatus );
      });
    },
    ///////////////////////////////////////////////////////////////////////
    deleteMap: function(mapId){

      $.ajax({
        type: "POST",
        url: "/api/map/delete",
        data: { mapId:mapId }
      })
      .done( function(msg){

        if( msg.ok ){

          $("#map-row-"+mapId).remove();

        }else{
          console.log("Error deleting map - "+msg.err);
        }

      })
      .fail( function( jqXHR, textStatus ) {
        console.log(" Request failed: /api/map/delete: " + textStatus );
      });

    },
    ///////////////////////////////////////////////////////////////////////
    saveMap: function(mapId){

      var json = rpgWorld.getJSON(mapId);

      $.ajax({
        type: "POST",
        url: "/api/map/save",
        data: { mapId:mapId, json:json }
      })
      .done( function(msg){

        if( msg.ok ){

        }else{
          console.log("Error saving map - "+msg.err);
        }

      })
      .fail( function( jqXHR, textStatus ) {
        console.log(" Request failed: /api/map/save: " + textStatus );
      });

    },
    ///////////////////////////////////////////////////////////////////////
    // addToWorld offset - offset in height added after adding a token to the world
    addToWorld: function(url){

      // this is necessary to prevent stacking tokens
      var addOffset = 0.0;

      var view = rpgView.getView();

      // position on the world baased on addOffset
      var ret = rpgView.convertToWorldPosition({x:(view.width / 2.0) - (view.gridw / 2.0),
                                                y:(view.height / 2.0) - (view.gridh / 2.0) + addOffset});

      addOffset += view.gridh;
      addOffset = addOffset % (view.height-view.gridh);

      var token = rpgToken.generate(null,null,url,ret.x,ret.y);

      rpgShell.addToken(rpgTable.get("gmMapId"),token);
    },
    ///////////////////////////////////////////////////////////////////////
  };
}());
