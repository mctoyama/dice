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

///////////////////////////////////////////////////////////////////////
// Canvas application

///////////////////////////////////////////////////////////////////////
/*

   take real care when dealing with

   world.height
   world.width

   view.scale
   view.top
   view.left
   view.rendertop
   view.renderleft
   view.height
   view.width
   view.renderh
   view.renderw

   there are various math fixing for the zoom interface

 */

///////////////////////////////////////////////////////////////////////

var rpgView = (function() {

  // view structure for canvas
  var view = {id:"", scale: 1.0, top:0, left:0, rendertop:0, renderleft:0, width:0, height:0, renderw: 0, renderh: 0, gridw:64, gridh:64};

  // move view zone
  // size of the move zone
  // speed of the move
  // lastHitTime - only moves after 500 millisec
  var moveView = {size:64, speed: 5, lastHitTime: null};

  // scroll bars
  var hscroll = {color:"#000000", width:128, height:16};
  var vscroll = {color:"#000000", width:16, height:128};

  // mouse coordinates in screen coordinates
  var mouse = {x:0, y:0, lastX:0, lastY:0, oncanvas: false};

  return {
    ///////////////////////////////////////////////////////////////////////
    // returns view structure
    getView: function(){
      return view;
    },
    ///////////////////////////////////////////////////////////////////////
    // Convert mouse position on computer screen to world coordinates
    convertToWorldPosition: function(point){

      var ret = rpgView.convertToCanvasPosition(point);

      ret.x = ret.x + view.renderleft;
      ret.y = ret.y + view.rendertop;

      ret.x = ret.x / view.scale;
      ret.y = ret.y / view.scale;

      return(ret);
    },
    ///////////////////////////////////////////////////////////////////////
    // returns mouse click position on computer screen to canvas coordinates
    convertToCanvasPosition: function(point){

      var ret = {x:0,y:0};

      var vp = $("#"+view.id).offset();

      ret.x = point.x - vp.left;
      ret.y = point.y - vp.top;

      return(ret);
    },

    ///////////////////////////////////////////////////////////////////////
    drawScroll: function drawScroll(context){

      context.save();

      // horizontal scroll
      var centralLeft = (view.renderw / 2) - (view.width/2);
      var hCentralLeft = (view.width/2) - (hscroll.width/2);

      var x = hCentralLeft * view.renderleft / centralLeft;

      context.fillStyle = hscroll.color;
      context.fillRect(x, (view.height - hscroll.height), hscroll.width, hscroll.height);

      // vertical scroll
      var centralTop = (view.renderh / 2) - (view.height/2);
      var vCentralTop = (view.height/2) - (vscroll.height/2);

      var y = vCentralTop * view.rendertop / centralTop;

      context.fillStyle = vscroll.color;
      context.fillRect((view.width - vscroll.width), y , vscroll.width, vscroll.height);

      context.restore();
    },

    //////////////////////////////////////
    drawMoveZone: function drawMoveZone(context){

      if( mouse.onCanvas ){

        context.save();

        context.globalAlpha=0.2;

        if( mouse.lastX > (view.width - moveView.size) )
          context.fillRect(view.width-moveView.size,0,view.width,view.height);

        if( mouse.lastX < moveView.size )
          context.fillRect(0,0,moveView.size,view.height);

        if( mouse.lastY > (view.height - moveView.size) )
          context.fillRect(0,view.height-moveView.size,view.width,view.height);

        if( mouse.lastY < moveView.size )
          context.fillRect(0,0,view.width,moveView.size);

        context.restore();
      }
    },

    //////////////////////////////////////
    // update layout
    updateLayout: function updateLayout(){

      view.width = $("#leftBox").width();
      view.height = $(window).height();

      var canvas = document.getElementById(view.id);
      canvas.width = view.width;
      canvas.height = view.height;

      rpgView.updateView(view.scale);

      //    $("#"+view.id).css({position: "absolute", top:"0px",left:"0px"});
      //    $("#rightBox").css({position: "absolute", width: "256px", height: $(window).height()+"px", bottom: "0px", right: "0px"});

    },

    ///////////////////////////////////////////////////////////////////////
    // init canvas
    initCanvas: function initCanvas(displayId){

      // html canvas element id
      view.id = displayId;

      // show canvas
      // $("#"+view.id).show();

      // updating layout
      rpgView.updateLayout();

      $("#"+view.id).attr("align","center");

      $("#"+view.id).bind("mouseenter", function(){

        // setting on canvas
        mouse.onCanvas = true;

        // mouse move in canvas
        $("#"+view.id).bind("mousemove", function(e){

          var pos = rpgView.convertToWorldPosition({x:e.pageX,y:e.pageY});

          rpgWorld.mouseMove(pos);

          $("#"+view.id).css("cursor",rpgWorld.getCursor());

          var mousePos = rpgView.convertToCanvasPosition({x:e.pageX,y:e.pageY});

          mouse.lastX = mouse.x;
          mouse.lastY = mouse.y;

          mouse.x = mousePos.x;
          mouse.y = mousePos.y;

        });

      });

      // mouse leaving canvas - reseting data
      $("#"+view.id).bind("mouseleave",function(e){

          mouse.x = view.width / 2.0;
          mouse.y = view.height / 2.0;
          mouse.lastX = mouse.x;
          mouse.lastY = mouse.y;

        rpgWorld.mouseLeave();
      });

      // mouse down event
      $("#"+view.id).bind("mousedown",function(e){

        // setting on canvas
        mouse.onCanvas = false;

        var pos = rpgView.convertToWorldPosition({x:e.pageX,y:e.pageY});

        rpgWorld.mouseDown(e.which,pos);
      });

      // mouse up events
      $("#"+view.id).bind("mouseup", function(e){

        rpgWorld.mouseUp(e);
      });

      // zoom
      var canvas = document.getElementById(view.id);
      if (canvas.addEventListener) {
        // IE9, Chrome, Safari, Opera
        canvas.addEventListener("mousewheel", rpgView.mouseWheelHandler, false);
        // Firefox
        canvas.addEventListener("DOMMouseScroll", rpgView.mouseWheelHandler, false);
      }
      // IE 6/7/8
      else canvas.attachEvent("onmousewheel", rpgView.mouseWheelHandler);

    },
    //////////////////////////////////////
    // move world view
    moveWorldPort: function(){

      var flag = false;

      if( mouse.onCanvas === true ){

        var now = new Date().getTime();

        var delta = {x:0, y:0};

        if( mouse.x > (view.width - moveView.size) ){

          delta.x = moveView.speed;
          flag = true;
        }

        if( mouse.x < moveView.size ){

          delta.x = -1 * moveView.speed;
          flag = true;
        }

        if( mouse.y > (view.height - moveView.size) ){

          delta.y = moveView.speed;
          flag = true;
        }

        if( mouse.y < moveView.size ){

          delta.y = -1 * moveView.speed;
          flag = true;
        }

        if( flag === true ){
          if( !rpgTable.validate(moveView.lastHitTime) ){
            moveView.lastHitTime = new Date().getTime();
          }
        }else{
          moveView.lastHitTime = null;
        }

        // only updates after 500 mili on move zone
        if( rpgTable.validate(moveView.lastHitTime) && (now - moveView.lastHitTime) > 500 ){

          rpgView.updateViewLeft(view.renderleft + delta.x / view.scale);

          if( view.renderleft < 0 ){
            rpgView.updateViewLeft(0);
          }else{
            if( (view.renderleft + view.width) > view.renderw){
              rpgView.updateViewLeft(view.renderw - view.width);
            }
          }

          rpgView.updateViewTop(view.rendertop + delta.y / view.scale);

          if( view.rendertop < 0 ){
            rpgView.updateViewTop(0);
          }else{
            if( (view.rendertop + view.height) > view.renderh){
              rpgView.updateViewTop(view.renderh - view.height);
            }
          }
        }
      }
    },

    //////////////////////////////////////
    // zoom in / out handler
    mouseWheelHandler: function mouseWheelHandler(e) {

      // cross-browser wheel delta
      e = window.event || e; // old IE support
      var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

      var anterior = view.scale;
      var next = view.scale + delta/10.0;

      if( next > 2.0 )
        next = 2.0;

      rpgView.updateView(next);

      if( view.renderh < view.height || view.renderw < view.width )
        rpgView.updateView(anterior);

      if( view.renderleft < 0 ){
        rpgView.updateViewLeft(0);
      }else{
        if( (view.renderleft + view.width) > view.renderw){
          rpgView.updateViewLeft(view.renderw - view.width);
        }
      }

      if( view.rendertop < 0 ){
        rpgView.updateViewTop(0);
      }else{
        if( (view.rendertop + view.height) > view.renderh){
          rpgView.updateViewTop(view.renderh - view.height);
        }
      }

      e.preventDefault();
    },
    //////////////////////////////////////
    updateView: function(val){

      view.scale = val;
      view.rendertop = view.top * view.scale;
      view.renderleft = view.left * view.scale;
      view.renderw = rpgWorld.getWidth() * view.scale;
      view.renderh = rpgWorld.getHeight() * view.scale;
    },
    //////////////////////////////////////
    updateViewLeft: function updateViewLeft(val){
      view.renderleft = val;
      view.left = view.renderleft / view.scale;
    },
    //////////////////////////////////////
    updateViewTop: function updateViewTop(val){
      view.rendertop = val;
      view.top = view.rendertop / view.scale;
    },
    //////////////////////////////////////
    // refresh the canvas
    refresh: function refresh(){

      var canvas = document.getElementById(view.id);

      if( canvas !== undefined && canvas !== null ){

        // moving world port
        rpgView.moveWorldPort();

        var context = canvas.getContext("2d");

        // resizing canvas if necessary
        rpgView.updateLayout();

        // save context
        context.save();

        // clean view
        context.fillStyle = "#FFFFFF";
        context.fillRect(0,0,view.width,view.height);

        // restore context
        context.restore();

        ///////////////////
        // main draw cicle

        context.save();

        context.translate(-1 * view.renderleft, -1 * view.rendertop);
        context.scale(view.scale,view.scale);

        // draw world
        rpgWorld.draw(context);

        // draw grid
        rpgWorld.drawGrid(context);

        context.restore();

        context.save();

        // draw scroll
        rpgView.drawScroll(context);

        // draw move zone
        rpgView.drawMoveZone(context);

        context.restore();
      }
    },
    //////////////////////////////////////
  };
}());
//////////////////////////////////////
