(this["webpackJsonpgallery-builder"]=this["webpackJsonpgallery-builder"]||[]).push([[0],{39:function(e,t,n){},40:function(e,t,n){},41:function(e,t,n){},48:function(e,t,n){},49:function(e,t,n){},50:function(e,t,n){},51:function(e,t,n){},52:function(e,t,n){},53:function(e,t,n){},55:function(e,t,n){"use strict";n.r(t);var i=n(2),c=n(0),a=n.n(c),r=n(20),o=n.n(r),s=(n(39),n(40),n(41),n(6)),l=n(16),d=n(32),u=Object(l.c)({default:function(){return[]},screenWidth:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:1,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"SET_SCREENWIDTH":return t.screenWidth;default:return e}},images:function(){var e,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],n=arguments.length>1?arguments[1]:void 0;switch(n.type){case"SET_IMAGES":return n.images;case"ADD_IMAGE":return t.concat(n.image);case"UPDATE_ICONINFO":return(e=t.slice()).find((function(e){return e.id==n.id})).iconInfo=n.iconInfo,e;case"DELETE_IMAGE":return e=(e=t.slice()).filter((function(e){return e.id!=n.id}));case"SELECT_ICON":return(e=t.slice()).find((function(e){return e.id==n.id})).iconSelected==n.iconId?(e.find((function(e){return e.id==n.id})).iconSelected=-1,e.find((function(e){return e.id==n.id})).iconInfo=null):e.find((function(e){return e.id==n.id})).iconSelected=n.iconId,e;case"UNSELECT_ICON":return(e=t.slice()).find((function(e){return e.id==n.id})).iconSelected=-1,e.find((function(e){return e.id==n.id})).iconInfo=null,e;default:return t}},imageSelected:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:-1,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"SELECT_IMAGE":return t.id;default:return e}},imageId:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"UPDATE_ID":return t.id;default:return e}},icons:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"ADD_ICON":return e.concat(t.icon);case"DELETE_ICON":var n=e.slice();return n=n.filter((function(e){return e.id!=t.id}));default:return e}},iconSelected:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:-1,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"SELECT_ICON":return e==t.iconId?-1:t.iconId;default:return e}},iconId:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"UPDATE_ICON_ID":return t.id;default:return e}},screen:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"SET_SCREEN":return{screenWidth:t.screenWidth,screenHeight:t.screenHeight,orientation:t.orientation};default:return e}},mode:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null,t=arguments.length>1?arguments[1]:void 0;switch(t.type){case"SELECT_MODE":return t.mode;default:return e}}}),h=n(18),g=n.n(h),f=n(33),b=g.a.mark(j);function j(){return g.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,Object(f.a)([]);case 2:case"end":return e.stop()}}),b)}var p=Object(d.a)(),v=[p],m=Object(l.e)(u,Object(l.d)(l.a.apply(void 0,v)));p.run(j);var O=m,x=n(11),E=n(7),w=n(8),y=(n(48),n(49),n(31));n(50);var I=function(e){var t=Object(s.b)((function(e){return e.iconId})),n=Object(s.b)((function(e){return e.mode})),c=Object(s.b)((function(e){return e.screen})),a=Object(s.b)((function(e){return e.images}));function r(){return(r=Object(y.a)(g.a.mark((function e(n){var i,c;return g.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(e.prev=0,i=n.target.files){e.next=4;break}return e.abrupt("return");case 4:c=t,Array.from(i).forEach((function(e,t,n){var i=new Image;i.src=URL.createObjectURL(e),i.onload=function(){O.dispatch({type:"ADD_ICON",icon:{url:this.src,height:this.height,width:this.width,id:c+t}})}})),O.dispatch({type:"UPDATE_ICON_ID",id:c+Array.from(i).length}),e.next=13;break;case 9:e.prev=9,e.t0=e.catch(0),alert(e.t0),console.log("Catch Error: ",e.t0);case 13:return e.prev=13,n.target.value="",e.finish(13);case 16:case"end":return e.stop()}}),e,null,[[0,9,13,16]])})))).apply(this,arguments)}return Object(i.jsxs)("div",{className:"user"==n&&c.screenWidth>768&&c.screenHeight>768?"actionContainer block":"actionContainer",children:["user"==n?Object(i.jsxs)(i.Fragment,{children:[Object(i.jsx)("label",{for:"add-image",children:"\u4e0a\u50b3\u5716\u7247"}),Object(i.jsx)("input",{onChange:function(e){return r.apply(this,arguments)},type:"file",id:"add-image",name:"uploadPhotoInput",accept:"image/*",multiple:"multiple"})]}):null,Object(i.jsx)("label",{onClick:function(){"user"==n?console.log(a.map((function(e){var t={};return t.id=e.id,t.iconInfo=e.iconInfo,t}))):"admin"==n&&console.log(a.map((function(e){var t={};return t.id=e.id,t.placeHolderInfo=e.iconInfo,t})))},children:"\u5132\u5b58"})]})},C=n(12),S=n.n(C),T=n(9);var N=function(e){var t=Object(s.b)((function(e){return e.mode})),n=Object(s.b)((function(e){return e.screen}));return Object(i.jsxs)("div",{className:"topBarContainer",children:[Object(i.jsxs)("div",{className:e.stepEnabled.back?"stepButton":"stepButton disabled",onClick:e.back,children:[Object(i.jsx)(S.a,{path:T.f,size:.8,style:{transform:"scaleX(-1)"},color:"grey"}),"\u5fa9\u539f"]}),Object(i.jsxs)("div",{className:e.stepEnabled.redo?"stepButton":"stepButton disabled",onClick:e.redo,children:[Object(i.jsx)(S.a,{path:T.f,size:.8,color:"grey"}),"\u91cd\u505a"]}),"admin"==t||n.screenHeight<=768||n.screenWidth<=768?Object(i.jsx)(I,{}):null]})},M=n.p+"static/media/placeholder.ed744db1.png";var D=function(e){var t=Object(s.b)((function(e){return e.mode})),n=Object(s.b)((function(e){return e.screen})),a=Object(s.b)((function(e){return e.images})),r=Object(s.b)((function(e){return e.imageSelected})),o=Object(s.b)((function(e){return e.icons})),l=Object(c.useState)({width:350,height:350,x:0,y:0,rot:0,scale:1,flip:!1}),d=Object(w.a)(l,2),u=d[0],h=d[1],g=Object(c.useState)(1),f=Object(w.a)(g,2),b=f[0],j=f[1],p=Object(c.useState)({}),v=Object(w.a)(p,2),m=v[0],E=v[1],y=Object(c.useState)({}),I=Object(w.a)(y,2),C=I[0],D=I[1],k=Object(c.useState)([{},{}]),_=Object(w.a)(k,2),B=_[0],H=_[1],A=Object(c.useState)({scale:1,dist:-1}),W=Object(w.a)(A,2),L=W[0],X=W[1],z=Object(c.useState)(0),P=Object(w.a)(z,2),U=P[0],G=P[1],Y=Object(c.useState)(!1),R=Object(w.a)(Y,2),F=R[0],J=R[1],q=Object(c.useState)(!1),K=Object(w.a)(q,2),Q=K[0],V=K[1],Z=Object(c.useState)(!1),$=Object(w.a)(Z,2),ee=$[0],te=$[1],ne=Object(c.useState)(!1),ie=Object(w.a)(ne,2),ce=ie[0],ae=ie[1],re=Object(c.useState)(!1),oe=Object(w.a)(re,2),se=oe[0],le=oe[1],de=Object(c.useState)([]),ue=Object(w.a)(de,2),he=ue[0],ge=ue[1],fe=Object(c.useState)({back:!1,redo:!1}),be=Object(w.a)(fe,2),je=be[0],pe=be[1],ve=Object(c.useState)([]),me=Object(w.a)(ve,2),Oe=me[0],xe=me[1],Ee=document.getElementById("editorImage");Ee&&Ee.addEventListener("touchmove",(function(e){e.preventDefault()}),{passive:!1});var we=-1==r?null:a.find((function(e){return e.id==r})),ye=-1==r?null:a.findIndex((function(e){return e.id==r})),Ie=-1==r||-1==we.iconSelected?null:o.find((function(e){return e.id==we.iconSelected}));Object(c.useEffect)((function(){null==ye&&a.length>0&&(O.dispatch({type:"SELECT_IMAGE",id:a[0].id}),ge(a.map((function(e){return[]}))),xe(a.map((function(e){return-1}))))}),[a]),Object(c.useEffect)((function(){Ne()}),[n]),Object(c.useEffect)((function(){-1!=r&&(le(!0),setTimeout((function(){le(!1);var e=Ne();Te(e),Ce()}),200))}),[r]),Object(c.useEffect)((function(){if(null!=Ie)J(!1),Te();else{var e=he.slice();e[ye]=[],ge(e);var t=Oe.slice();t[ye]=-1,xe(t)}}),[Ie]),Object(c.useEffect)((function(){U>1&&V(!1)}),[U]);var Ce=function(){var e=null!=ye&&he[ye].length>1&&0!=Oe[ye],t=null!=ye&&-1!=Oe[ye]&&he[ye].length>Oe[ye]+1;pe({back:e,redo:t})};Object(c.useEffect)((function(){Ce()}),[Oe]);var Se=function(e){if(O.dispatch({type:"UPDATE_ICONINFO",iconInfo:e,id:r}),null!=ye){var t=he.slice(),n=Oe.slice();t[ye]=t[ye].slice(0,n[ye]+1),t[ye].push(e),n[ye]+=1,ge(t),xe(n)}},Te=function(e){var i={};if(e||(e=b),"admin"==t){if(null==we.iconInfo){var c=n.screenWidth>768?350:150;i.rot=0,i.scale=1/e,i.width=c,i.height=c,i.x=.5*we.width,i.y=.5*we.height}else i=we.iconInfo;h(i),-1==Oe[ye]&&Se(i)}else"user"==t&&null!=Ie&&((i=null==we.iconInfo?we.placeHolder:we.iconInfo).scale*=.5*(i.width/Ie.width+i.height/Ie.height),i.width=Ie.width,i.height=Ie.height,h(i),-1==Oe[ye]&&Se(i))},Ne=function(){if(-1!=r){var e,t=document.getElementById("editorWindow").clientHeight,n=document.getElementById("editorWindow").clientWidth;return e=we.width/we.height>n/t?n/we.width:t/we.height,j(e),e}},Me=function(e){V(!0),E({x:e.clientX,y:e.clientY,startX:u.x,startY:u.y})},De=function(e){var t=(e.clientX-m.x)/b,n=(e.clientY-m.y)/b;h({width:u.width,height:u.height,x:m.startX+t,y:m.startY+n,rot:u.rot,scale:u.scale,flip:u.flip})},ke=function(e){te(!0);var t=document.getElementById("headMoving").getBoundingClientRect(),n=t.left+.5*t.width,i=t.top+.5*t.height,c=e.clientX-n,a=e.clientY-i;D({centerX:n,centerY:i,dist:Math.hypot(c,a),scale:u.scale,rotation:u.rot,angle:Math.atan2(a,c)/Math.PI*180})},_e=function(e){var t=e.clientX-C.centerX,n=e.clientY-C.centerY,i=C.scale*Math.hypot(t,n)/C.dist,c=C.rotation+(Math.atan2(n,t)/Math.PI*180-C.angle);h({width:u.width,height:u.height,x:u.x,y:u.y,rot:c,scale:i,flip:u.flip})},Be=function(){F&&(ee&&te(!1),Q&&V(!1),ce&&(X({scale:1,dist:-1}),H([{},{}]),ae(!1)),(ee||Q||ce)&&Se(u),G(0))},He=function(e,t){var n=B;1==e.nativeEvent.targetTouches.length?n=document.getElementById("headMoving")&&document.getElementById("headMoving").contains(e.nativeEvent.targetTouches[0].target)?[{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY},B[1]]:[B[0],{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY}]:2==e.nativeEvent.targetTouches.length&&document.getElementById("headMoving")&&document.getElementById("headMoving").contains(e.nativeEvent.targetTouches[0].target)&&(n=[{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY},{x:e.nativeEvent.targetTouches[1].clientX,y:e.nativeEvent.targetTouches[1].clientY}]),H(n),t&&0!=Object.keys(n[0]).length&&(ae(!0),X({scale:u.scale,dist:Math.hypot(n[0].x-n[1].x,n[0].y-n[1].y)}))};Object(c.useEffect)((function(){if(ce){var e=Math.hypot(B[0].x-B[1].x,B[0].y-B[1].y),t=L.scale*e/L.dist;h({width:u.width,height:u.height,x:u.x,y:u.y,rot:u.rot,scale:t,flip:u.flip})}}),[B]);var Ae=null;return ee?Ae=_e:Q&&(Ae=De),Object(i.jsxs)("div",{id:"editorContainer",onMouseMove:!x.isMobile&&Ae?function(e){return Ae(e.nativeEvent)}:null,onTouchMove:x.isMobile?function(e){F&&(He(e),Q&&document.getElementById("headMoving").contains(e.target)?De(e.nativeEvent.targetTouches[0]):ee&&e.target==document.getElementById("scaleButton")&&_e(e.nativeEvent.targetTouches[0]))}:null,onMouseUp:x.isMobile?null:Be,onTouchStart:x.isMobile?function(e){F&&(2==e.targetTouches.length?He(e,!0):0==U?(He(e),e.target==document.getElementById("scaleButton")?ke(e.nativeEvent.targetTouches[0]):document.getElementById("headMoving").contains(e.target)&&1==e.nativeEvent.targetTouches.length&&0==U&&Me(e.nativeEvent.targetTouches[0])):1!=U||ee||He(e,!0),G(U+1))}:null,onTouchEnd:x.isMobile?Be:null,children:[Object(i.jsx)(N,{stepEnabled:je,back:function(){if(je.back){var e;e=-1==Oe[ye]?he[ye].length-2:Oe[ye]-1;var t=he[ye][e];O.dispatch({type:"UPDATE_ICONINFO",iconInfo:t,id:r}),h(t);var n=Oe.slice();n[ye]=e,xe(n)}},redo:function(){if(je.redo){var e=Oe[ye]+1,t=he[ye][e];O.dispatch({type:"UPDATE_ICONINFO",iconInfo:t,id:r}),h(t);var n=Oe.slice();n[ye]=e,xe(n)}}}),-1!=r?Object(i.jsx)("div",{id:"editorWindow",children:Object(i.jsx)("div",{id:"editorImage",className:se?"changing":null,style:{backgroundImage:"url("+we.url+")",width:we.width,height:we.height,transform:"scale(".concat(b,")")},children:"admin"==t||void 0!=we.iconSelected&&-1!=we.iconSelected?Object(i.jsxs)("div",{id:"headMoving",className:"head",style:{width:u.width,height:u.height,transform:"translate(".concat(u.x-.5*u.width,"px, ").concat(u.y-.5*u.height,"px) rotate(").concat(u.rot,"deg) scale(").concat(u.scale,")")},onMouseEnter:function(){return J(!0)},onMouseLeave:function(){ee&&!x.isMobile||J(!1)},children:[Object(i.jsx)("div",{className:"headImage",style:"admin"==t?{backgroundImage:"url("+M+")"}:{backgroundImage:"url("+Ie.url+")",transform:"scaleX(".concat(u.flip?-1:1,")")},children:"admin"==t?Object(i.jsx)("p",{style:{fontSize:.1*u.width},children:"\u79fb\u52d5\u6b64\u5716\u793a"}):null}),u.scale>1&&"user"==t?Object(i.jsx)("div",{className:"headWarningContainer",style:{width:40/u.scale/b,height:40/u.scale/b,padding:10/u.scale/b},children:Object(i.jsx)("div",{className:"headWarning",style:{borderRadius:6/u.scale/b},children:Object(i.jsx)(S.a,{path:T.d,size:1.2/u.scale/b,color:"white"})})}):null,Object(i.jsxs)("div",{className:F?"tools enabled ":"tools",style:{borderWidth:3/u.scale/b},children:[Object(i.jsx)("div",{id:"dragClickArea",draggable:"false",style:{width:"100%",height:"100%"},onMouseDown:x.isMobile?null:function(e){return Me(e.nativeEvent)}}),Object(i.jsx)("div",{className:"editButton",id:"scaleButton",draggable:"false",style:{transform:"scale(".concat(1/u.scale/b,")")},onMouseDown:x.isMobile?null:function(e){return ke(e.nativeEvent)},children:Object(i.jsx)(S.a,{style:{pointerEvents:"none"},path:T.g,size:1,color:"white"})}),"user"==t?Object(i.jsxs)(i.Fragment,{children:[Object(i.jsx)("div",{className:"editButton",id:"flipButton",draggable:"false",style:{transform:"scale(".concat(1/u.scale/b,")")},onClick:F?function(){if(F){var e={width:u.width,height:u.height,x:u.x,y:u.y,rot:u.rot,scale:u.scale,flip:!u.flip};h(e),Se(e)}}:null,children:Object(i.jsx)(S.a,{path:T.e,size:1,color:"white"})}),Object(i.jsx)("div",{className:"editButton",id:"deleteButton",draggable:"false",style:{transform:"scale(".concat(1/u.scale/b,")")},onClick:F?function(){return O.dispatch({type:"UNSELECT_ICON",id:r})}:null,children:Object(i.jsx)(S.a,{path:T.c,size:1,color:"white"})})]}):null]})]}):Object(i.jsx)("div",{className:we.iconSelected&&-1!=we.iconSelected?"headImage hidden":"headImage",style:{backgroundImage:"url("+M+")",width:we.placeHolder.width,height:we.placeHolder.height,transform:"translate(".concat(we.placeHolder.x-.5*we.placeHolder.width,"px, ").concat(we.placeHolder.y-.5*we.placeHolder.height,"px) rotate(").concat(we.placeHolder.rot,"deg) scale(").concat(we.placeHolder.scale,")")},children:Object(i.jsx)("p",{style:{fontSize:.1*we.placeHolder.width},children:"\u8acb\u9078\u64c7\u982d\u50cf"})})})}):null,n.screenWidth<=768||n.screenHeight<=768?Object(i.jsxs)("div",{className:"editorBottom",children:[Object(i.jsx)("div",{className:ye>0?"pageArrow":"pageArrow disabled",onClick:function(){ye>0&&O.dispatch({type:"SELECT_IMAGE",id:a[ye-1].id})},children:Object(i.jsx)(S.a,{path:T.a,size:.8,rotate:0,color:"#DDDDDD",style:{transform:"translate(0.5px,0.5px)"}})}),Object(i.jsxs)("div",{className:"pageNumber",children:["\u7b2c ",ye+1," \u5f35"]}),Object(i.jsx)("div",{className:ye<a.length-1?"pageArrow":"pageArrow disabled",onClick:function(){ye<a.length-1&&O.dispatch({type:"SELECT_IMAGE",id:a[ye+1].id})},children:Object(i.jsx)(S.a,{path:T.a,size:.8,color:"#DDDDDD",style:{transform:"translate(1.5px,0.5px) rotate(180deg)"}})})]}):null]})};n(51),n(52);var k=function(e){var t,n,a=Object(s.b)((function(e){return e.screen})),r=e.vertical,o=e.images,l=e.selectedId,d=e.selectedText,u=e.selectItem,h=e.deleteItem,g=e.canDelete,f=Object(c.useState)(-1),b=Object(w.a)(f,2),j=b[0],p=b[1];a.screenWidth>768&&a.screenHeight>768?r?(t=180,n=100):(t=230,n=100):(t=100,n=100);var v=o.map((function(e,c){var a,r,o=e.width/e.height;o>t/n?(a=t,r=t/o):(r=n,a=n*o);var s="";return l==e.id&&(s+=" selected"),j==e.id&&(s+=" pressed"),Object(i.jsxs)("div",{className:"sliderImageWrapper"+s,style:{width:t,height:n,"--slider-image-width":t+"px","--slider-image-height":n+"px"},children:[Object(i.jsxs)("div",{className:"sliderImage",style:{width:a,height:r},children:[Object(i.jsx)("img",{src:e.url,style:{width:"100%",height:"100%"},onClick:x.isMobile?function(){j==e.id?p(-1):p(e.id)}:function(){return u(e.id)},onMouseLeave:function(e){console.log(e.relatedTarget.className),"deleteButtonClickArea"!=e.relatedTarget.className&&"chooseButtonClickArea"!=e.relatedTarget.className&&p(-1)}}),g&&!x.isMobile?Object(i.jsx)("div",{className:"deleteButton",onClick:function(){return h(e.id)},children:Object(i.jsx)(S.a,{path:T.b,style:{transform:"translate(0.5px,0.5px)"},size:.8,color:"#DDDDDD"})}):null]}),Object(i.jsx)("div",{className:"statusWrapper",children:Object(i.jsx)("div",{className:"statusWrapperBox",children:d})}),g&&x.isMobile?Object(i.jsx)("div",{className:"deleteButtonClickArea",onClick:function(){j==e.id&&h(e.id)},children:Object(i.jsx)("div",{className:"deleteButton",children:Object(i.jsx)(S.a,{path:T.b,style:{transform:"translate(0.5px,0.5px)",pointerEvents:"none"},size:.8,color:"#DDDDDD"})})}):null,Object(i.jsx)("div",{className:"chooseButtonWrapper",children:Object(i.jsx)("div",{className:"chooseButtonClickArea",onClick:function(){j==e.id&&u(e.id)},children:Object(i.jsx)("div",{className:"chooseButton",children:l==e.id?"\u53d6\u6d88":"\u9078\u64c7"})})})]})}));return Object(i.jsx)("div",{className:r?"sliderContainer vertical":"sliderContainer",children:Object(i.jsx)("div",{className:"sliderScrollContainer",children:v})})};var _=function(){var e=Object(s.b)((function(e){return e.images})),t=Object(s.b)((function(e){return e.imageSelected}));return Object(i.jsx)(k,{images:e,selectedId:t,selectedText:"\u5716\u7247\u7de8\u8f2f\u4e2d",selectItem:function(e){return O.dispatch({type:"SELECT_IMAGE",id:e})},deleteItem:function(n){if(t==n){var i=e.findIndex((function(e){return e.id==t}));i<e.length-1?i+=1:i-=1,-1==i?O.dispatch({type:"SELECT_IMAGE",id:-1}):O.dispatch({type:"SELECT_IMAGE",id:e[i].id})}O.dispatch({type:"DELETE_IMAGE",id:n})}})};n(53);var B=function(e){var t,n,c=Object(s.b)((function(e){return e.screen})),a=Object(s.b)((function(e){return e.images})),r=Object(s.b)((function(e){return e.imageSelected})),o=Object(s.b)((function(e){return e.icons})),l=(Object(s.b)((function(e){return e.iconId})),function(){return a.find((function(e){return e.id==r}))});c.screenWidth>768&&c.screenHeight>768?(t=240,n="100%"):c.screenHeight>c.screenWidth?(t="100%",n="100%"):(t=150,n="100%");var d={width:t,height:n};return Object(i.jsxs)("div",{className:"iconsListContainer",style:d,children:[c.screenWidth<=768||c.screenHeight<=768?null:Object(i.jsx)(I,{}),Object(i.jsx)(k,{vertical:c.screenWidth>768||c.screenHeight<=c.screenWidth,images:o,canDelete:!0,selectedId:l()?l().iconSelected:-1,selectedText:"\u5df2\u9078\u64c7",selectItem:function(e){-1!=r&&O.dispatch({type:"SELECT_ICON",iconId:e,id:r})},deleteItem:function(e){a.some((function(t){return t.iconSelected==e}))||O.dispatch({type:"DELETE_ICON",id:e})}})]})},H=[{url:"https://cdn.cjr.org/wp-content/uploads/2019/07/AdobeStock_100000042-e1563305717660-686x371.jpeg",width:686,height:371,id:0,placeHolder:{width:350,height:350,x:273.07046979865777,y:209.53020134228188,rot:0,scale:.23930968360498564}},{url:"https://www.geeklawblog.com/wp-content/uploads/sites/528/2018/12/liprofile-656x369.png",width:656,height:369,id:1,placeHolder:{width:350,height:350,x:273.07046979865777,y:209.53020134228188,rot:0,scale:.23930968360498564}},{url:"https://png.pngtree.com/thumb_back/fh260/background/20190828/pngtree-dark-vector-abstract-background-image_302715.jpg",width:555,height:260,id:2,placeHolder:{width:350,height:350,x:273.07046979865777,y:209.53020134228188,rot:0,scale:.23930968360498564}},{url:"https://www.incimages.com/uploaded_files/image/1920x1080/westworld-2-hbo-background-1920_419617.jpg",width:1920,height:1080,id:3,placeHolder:{width:350,height:350,x:273.07046979865777,y:209.53020134228188,rot:0,scale:.23930968360498564}},{url:"https://cdn.cjr.org/wp-content/uploads/2019/07/AdobeStock_100000042-e1563305717660-686x371.jpeg",width:686,height:371,id:4,placeHolder:{width:350,height:350,x:273.07046979865777,y:209.53020134228188,rot:0,scale:.23930968360498564}},{url:"https://www.incimages.com/uploaded_files/image/1920x1080/westworld-2-hbo-background-1920_419617.jpg",width:1920,height:1080,id:5,placeHolder:{width:350,height:350,x:273.07046979865777,y:209.53020134228188,rot:0,scale:.23930968360498564}}];var A=function(){new URLSearchParams(Object(E.d)().search);var e,t=Object(s.b)((function(e){return e.mode})),n=Object(s.b)((function(e){return e.screen}));function a(){O.dispatch({type:"SET_SCREEN",screenWidth:window.innerWidth,screenHeight:window.innerHeight,orientation:window.matchMedia("(orientation: portrait)")?"landscape":"portrait"})}return window.addEventListener("resize",(function(){clearTimeout(e),e=setTimeout(a,500)})),Object(c.useEffect)((function(){O.dispatch({type:"SELECT_MODE",mode:"admin"}),O.dispatch({type:"SET_IMAGES",images:H}),O.dispatch({type:"SET_SCREEN",screenWidth:window.innerWidth,screenHeight:window.innerHeight,orientation:window.matchMedia("(orientation: portrait)")?"landscape":"portrait"})}),[]),Object(i.jsxs)("div",{className:x.isMobile?"appContainer isMobile":"appContainer isDesktop",style:{height:n.screenHeight},children:["user"==t&&(n.screenWidth>768||n.screenHeight<n.screenWidth)?Object(i.jsx)(B,{}):null,Object(i.jsxs)("div",{style:{flex:1},className:"ColumnRevContainer",children:[n.screenHeight>768||n.screenHeight>=n.screenWidth&&"user"==t?Object(i.jsx)("div",{className:"bottomRow",children:n.screenWidth>768?Object(i.jsx)(_,{}):Object(i.jsx)(B,{})}):null,Object(i.jsx)(D,{})]})]})},W=function(e){e&&e instanceof Function&&n.e(3).then(n.bind(null,56)).then((function(t){var n=t.getCLS,i=t.getFID,c=t.getFCP,a=t.getLCP,r=t.getTTFB;n(e),i(e),c(e),a(e),r(e)}))},L=n(25);o.a.render(Object(i.jsx)(a.a.StrictMode,{children:Object(i.jsx)(s.a,{store:O,children:Object(i.jsx)(L.a,{children:Object(i.jsx)(A,{})})})}),document.getElementById("gallery-builder-root")),W()}},[[55,1,2]]]);
//# sourceMappingURL=main.eb0652fa.chunk.js.map