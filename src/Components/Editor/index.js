import './style.css';
import React, { useState, useEffect, useCallback, useRef} from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import {isMobile} from 'react-device-detect';
import {Services} from '../../services';

import TopBar from '../../Components/TopBar';
import Icon from '@mdi/react'
import TitleSetting from '../../Components/TitleSetting';
import { mdiMagnifyPlusOutline } from '@mdi/js';
import { mdiMagnifyMinusOutline } from '@mdi/js';
import { mdiExclamationThick } from '@mdi/js';
import { mdiFlipHorizontal } from '@mdi/js';
import { mdiDelete } from '@mdi/js';
import { mdiArrowLeftBold } from '@mdi/js';
import { mdiRotateLeft } from '@mdi/js';
import { mdiArrowTopRightBottomLeftBold } from '@mdi/js';

import placeHolderImage from '../../placeHolderImage.png';

const PLACEHOLDER_SIZE = 350;

function Editor() {

  const init = useSelector(state => state.init);
  const status = useSelector(state => state.status);
  const screen = useSelector(state => state.screen);
  const display = useSelector(state => state.display);
  const overlay = useSelector(state => state.overlay);
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);
  const icons = useSelector(state => state.icons);

  const [currentSelectedId,setCurrentSelectedId] = useState(-1);
  const [editorScale,setEditorScale] = useState(null);
  const [oldEditorScale,setOldEditorScale] = useState(1);
  const [editorSize,setEditorSize] = useState(500);
  const [zoomOffset,setZoomOffset] = useState({x:0,y:0});
  const [currentObject,setCurrentObject] = useState(null);
  const [frontObject,setFrontObject] = useState(null);
  const [iconInfo,setIconInfo] = useState({width:PLACEHOLDER_SIZE,height:PLACEHOLDER_SIZE,x:0,y:0,rot:0,scale:1,flip:false});
  const [textInfo,setTextInfo] = useState(null);
  const [iconTooBig,setIconTooBig] = useState(false);

  const [dragStart,setDragStart] = useState({});
  const [scaleStart,setScaleStart] = useState({});
  const [scaleTextStart,setScaleTextStart] = useState({});
  const [dragTwoFingerXY,setDragTwoFingerXY] = useState([{},{}]);
  const [dragTwoFingerStart,setDragTwoFingerStart] = useState({scale:1,dist:-1});
  const [touchCount,setTouchCount] = useState(0);
  const [dragTextSettingStart,setDragTextSettingStart] = useState({});
  const [textSettingPos,setTextSettingPos] = useState({x:0,y:0});

  const [isEditing,setIsEditing] = useState(false);
  const [isZooming,setIsZooming] = useState(false);
  const [isDragging,setIsDragging] = useState(false);
  const [isDraggingTextSetting,setIsDraggingTextSetting] = useState(false);
  const [isMoved,setIsMoved] = useState(false);
  const [isScaling,setIsScaling] = useState(false);
  const [isScalingText,setIsScalingText] = useState(false);
  const [isTwoFingerDragging,setIsTwoFingerDragging] = useState(false);
  const [isChanging,setIsChanging] = useState(false);
  const [isTextSetting,setIsTextSetting] = useState(false);
  const [isTextLoading,setIsTextLoading] = useState(false);

  const editor = document.getElementById('editorWindow');
  const preventDefault = useCallback((e) => { e.preventDefault(); }, [])

  const currentImage = currentSelectedId==-1? null:images.find(image => image.id == currentSelectedId);
  const currentIcon = currentSelectedId==-1 || (currentImage!=null&&currentImage.iconSelected==-1)? null:icons.find(icon=>icon.id==currentImage.iconSelected); 
  
  useEffect(() => {
    if(overlay.mode=='titleSetting') {
      setIsTextSetting(true)
    }
    else if(isTextSetting) setIsTextSetting(false);
  }, [overlay]);

  useEffect(() => {
    if(overlay.mode=='loading'&&images.length==init.images&&!images.some(x=>x.loading||x.deleting)) {
      if(status.mode=='user'&&!status.demo&&!status.view&&status.isFirst) store.dispatch({type:'SET_OVERLAY',mode:'init'});
      else store.dispatch({type:'CLOSE_OVERLAY'});
    }

    if(imageSelected==-1&&images.length>0) {
      if(images.find(image => image.order == 0) && !images.find(image => image.order == 0).loading) store.dispatch({type:'SELECT_IMAGE',id:images.find(image => image.order == 0).id});
    }
  }, [images]);
 
  useEffect(() => {
    updateImageSize();
  }, [screen]);

  useEffect(() => {
    if(imageSelected!=-1) {
      setIsChanging(true);
      setTimeout(()=> {
        setCurrentSelectedId(imageSelected);
      }, 200);
    }
    setIsTextSetting(false);

  }, [imageSelected]);

  useEffect(() => {
    if(currentSelectedId!=-1) {
        updateImageSize();
        setIsChanging(false);
        updateEditorIconInfo();
        updateEditorTextInfo();
    }
  }, [currentSelectedId]);

  useEffect(() => {
    if(currentIcon!=null) {
      setIsEditing(false);
      updateEditorIconInfo();
    }
    // else if(imageSelected!=-1){
    //   // store.dispatch({type:'UPDATE_STEP',step:null,id:imageSelected});
    // }
  }, [currentIcon]);

  useEffect(() => {
    if(iconInfo.scale>1&&iconTooBig!=null&&!iconTooBig&&currentObject=='headObject') {
      setIconTooBig(true);
      if(isMobile)setTimeout(()=> {
        setIconTooBig(null);
      }, 3000);
    }
    if(iconInfo.scale<=1) setIconTooBig(false);
  }, [iconInfo.scale]);

  useEffect(() => {
    if(touchCount>1) {
      setIsDragging(false);
    }
  }, [touchCount]);

  let setInfo,objectInfo;
  if(currentObject==null){
    setInfo = () => console.log('set info null');
  }
  else if(currentObject=='headObject') {
    setInfo = setIconInfo;
    objectInfo = iconInfo;
  }
  else if(currentObject=='textObject') {
    setInfo = setTextInfo;
    objectInfo = textInfo;
  }

  const updateEditorIconInfo = () => {
    let iconInfo = {};
    if (status.mode=='admin'){
      saveStep(currentImage.iconInfo,'headObject',true);
      setIconInfo(currentImage.iconInfo);
    }
    else if (status.mode=='user') {
      iconInfo = currentImage.iconInfo;
      if(currentIcon!=null && !currentIcon.loading){
        iconInfo.scale *= (currentImage.iconInfo.width/currentIcon.width + currentImage.iconInfo.height/currentIcon.height)*0.5;
        iconInfo.width = currentIcon.width;
        iconInfo.height = currentIcon.height;
        saveStep(iconInfo,'headObject',true);
      }
      setIconInfo(iconInfo);
    }   
  }

  const updateEditorTextInfo = () => {
    if(currentImage.textInfo!=null){
      saveStep(currentImage.textInfo,'textObject',true);
      setTextInfo(currentImage.textInfo);
    }
    else setTextInfo(null);
  }

  const addNewText = () => {
    if(textInfo==null){
      setIsTextLoading(true);

      let TEXT_DISPLAY_WIDTH = display=='large'? 350:150;
      let TEXT_WIDTH = 2000;
      let TEXT_HEIGHT = 400;
      let textInfo = {
        rot: -20,
        scale: TEXT_DISPLAY_WIDTH/TEXT_WIDTH/editorScale,
        width: TEXT_WIDTH,
        height: TEXT_HEIGHT,
        align: 'center',
      };
      textInfo.x = TEXT_WIDTH*textInfo.scale*0.5 + 40/editorScale;
      textInfo.y = TEXT_HEIGHT*textInfo.scale*0.5 + 70/editorScale;
    
      setTextInfo(textInfo);
      saveStep(textInfo,'textObject',true);

      setCurrentObject('textObject');
      setFrontObject('textObject');
      setIsEditing(true);

      Services.adminUpdatePhotos(
        [currentImage],
        () => setTimeout(Services.titleToImage(imageSelected,"This is {**Customer_INPUT**}'s Album",()=>setIsTextLoading(false)),300),
        // Services.titleToImage(imageSelected,"This is {**Customer_INPUT**}'s Album"),
        {color:'#000000'}
      );
    }
  }

  const updateImageSize = () => {
    if(imageSelected!=-1&&document.getElementById('editorWindow')){
      let editorHeight = document.getElementById('editorWindow').clientHeight;
      let editorWidth = document.getElementById('editorWindow').clientWidth;

      setEditorSize(Math.max(editorHeight,editorWidth));

      let ratio = currentImage.width / currentImage.height;
      let editorRatio = editorWidth/editorHeight;
      let editorScale;

      if(ratio>editorRatio) {
        editorScale = editorWidth/currentImage.width;
      }
      else {
        editorScale = editorHeight/currentImage.height;
      }

      setOldEditorScale(null);
      setZoomOffset({x:0,y:0});
      setEditorScale(editorScale);
    }
  }

  //zoom
  const zoom = (mode) => {
    setIsZooming(true);
    setTimeout(()=> {
      setIsZooming(false);
    }, 200);

    let editorHeight = document.getElementById('editorWindow').clientHeight;
    let editorWidth = document.getElementById('editorWindow').clientWidth;
    let editorSize = Math.min(editorHeight,editorWidth);

    let objectSize;
    if(mode=='icon') objectSize = Math.hypot(iconInfo.width,iconInfo.height)*iconInfo.scale;
    else if(mode=='text') objectSize = Math.hypot(textInfo.width,textInfo.height);

    let editorScale_new = editorSize/objectSize*0.75;
    let xMax = Math.abs(currentImage.width*0.5-editorWidth*0.5/editorScale_new);
    let yMax = Math.abs(currentImage.height*0.5-editorHeight*0.5/editorScale_new);

    let objectInfo;
    if(mode=='icon') objectInfo = iconInfo;
    else if(mode=='text') objectInfo = textInfo;

    let x = currentImage.width*0.5-objectInfo.x;
    if(x<0) x = Math.max(x,-xMax);
    else if(x>0) x = Math.min(x,xMax);

    let y = currentImage.height*0.5-objectInfo.y;
    if(y<0) y = Math.max(y,-yMax);
    else if(y>0) y = Math.min(y,yMax);

    if(editorScale_new>editorScale) {
      if(oldEditorScale==null) setOldEditorScale(editorScale);
      setZoomOffset({x:x*editorScale_new,y:y*editorScale_new});
      setEditorScale(editorScale_new);
    }
  }

  const zoomReset = () => {
    setIsZooming(true);
    setTimeout(()=> {
      setIsZooming(false);
    }, 200);

    if(oldEditorScale!=null) {
      setZoomOffset({x:0,y:0});
      setEditorScale(oldEditorScale);
      setOldEditorScale(null);
    }
  }
  
  //step
  const stepEnabled = () => {
    if(status.mode=='user'&&currentIcon==null) return {back:false,redo:false};
    else if(currentImage!=null && currentImage.step!=null){
      let back = currentImage!=null && currentImage.step.store.length>2 && currentImage.step.current!=1;
      let redo = currentImage!=null && currentImage.step.store.length>currentImage.step.current+1;
      return {back:back,redo:redo};
    }
    else return {back:false,redo:false}
  }

  const saveStep = (objectInfo,object,init) => {
    if(!object) object = currentObject;
    if(object=='headObject') store.dispatch({type:'UPDATE_ICONINFO',iconInfo:objectInfo,id:imageSelected});
    else if(object=='textObject')store.dispatch({type:'UPDATE_TEXTINFO',textInfo:objectInfo,id:imageSelected});
    
    if(object!=null){
      let step = {
        hey:'sdsdf',
        current: currentImage.step.current,
        store: currentImage.step.store.slice()
      };

      if(step.store.find(x=>x.object==object).objectInfo===null){
        step.store.find(x=>x.object===object).objectInfo = objectInfo;
      }
      else if(!init) {
        step.store = step.store.slice(0,step.current+1);
        step.store.push({object:object,objectInfo:objectInfo});
        step.current += 1;
      }

      store.dispatch({type:'UPDATE_STEP',step:step,id:imageSelected});
    }
  }

  const stepMove = (mode) => {
    let step = Object.assign({}, currentImage.step); 
    let object,newObjectInfo;

    if(mode=='back'){
      object = step.store[step.current].object;
      newObjectInfo = step.store.slice(0,step.current).reverse().find(x=>x.object==object).objectInfo;
      step.current -= 1;
    }
    else if(mode=='redo'){
      step.current += 1;
      object = step.store[step.current].object;
      newObjectInfo = step.store[step.current].objectInfo;
    }

    if(object=='headObject') {
      setIconInfo(newObjectInfo);
      store.dispatch({type:'UPDATE_ICONINFO',iconInfo:newObjectInfo,id:imageSelected});
    }
    else if(object=='textObject') {
      setTextInfo(newObjectInfo);
      store.dispatch({type:'UPDATE_TEXTINFO',textInfo:newObjectInfo,id:imageSelected});
    }

    store.dispatch({type:'UPDATE_STEP',step:step,id:imageSelected});
  }

  //move
  const handleDragStart = (ev) => {
    setIsDragging(true);
    setDragStart({
      x:ev.clientX,
      y:ev.clientY,
      startX:objectInfo.x,
      startY:objectInfo.y,
    });
  }

  const handleDragMove = (ev) => {
    let x = (ev.clientX - dragStart.x)/editorScale;
    let y = (ev.clientY - dragStart.y)/editorScale;
    setInfo({...objectInfo,  ...{x:dragStart.startX+x,y:dragStart.startY+y} });
   
    setIsMoved(true);
  }

  const handleScaleStart = (ev) => {
    setIsScaling(true);
    let object = document.getElementById(currentObject).getBoundingClientRect();
    let centerX = object.left+object.width*0.5;
    let centerY = object.top+object.height*0.5;
    let x = ev.clientX - centerX;
    let y = ev.clientY - centerY; 
    setScaleStart({
      centerX:centerX,
      centerY:centerY,
      dist:Math.hypot(x,y),
      scale:objectInfo.scale,
      rotation:objectInfo.rot,
      angle: Math.atan2(y,  x) / Math.PI * 180,
    });
  }

  const handleScaleMove = (ev) => {
    let minScale = 20;

    let x = ev.clientX - scaleStart.centerX;
    let y = ev.clientY - scaleStart.centerY; 
    let scale = scaleStart.scale*Math.hypot(x,y)/scaleStart.dist;
    if (objectInfo.width*scale*editorScale < minScale || objectInfo.height*scale*editorScale < minScale) scale = Math.max(minScale/objectInfo.width/editorScale,minScale/objectInfo.height/editorScale);  
    let rot = scaleStart.rotation + (Math.atan2(y,  x) / Math.PI * 180 - scaleStart.angle);
    setInfo({...objectInfo,  ...{rot:rot,scale:scale} });
    setIsMoved(true);
  }

  const handleScaleTextStart = (ev) => {
    setIsScalingText(true);
    let object = document.getElementById(currentObject).getBoundingClientRect();
    let centerX = object.left+object.width*0.5;
    let centerY = object.top+object.height*0.5;
    let x = ev.clientX - centerX;
    let y = ev.clientY - centerY; 
    let angle = Math.PI*0.5 - Math.atan2(x,y) - objectInfo.rot * Math.PI / 180;
    let distX = Math.hypot(x,y) * Math.cos(angle);
    let distY = Math.hypot(x,y) * Math.sin(angle);
    setScaleTextStart({
      width:objectInfo.width,
      height:objectInfo.height,
      centerX:centerX,
      centerY:centerY,
      distX: distX,
      distY: distY,
    });
  }

  const handleScaleTextMove = (ev) => {
    let x = ev.clientX - scaleTextStart.centerX;
    let y = ev.clientY - scaleTextStart.centerY;

    let angle = Math.PI*0.5 - Math.atan2(x,y) - objectInfo.rot * Math.PI / 180;
    let distX = Math.hypot(x,y) * Math.cos(angle);
    let distY = Math.hypot(x,y) * Math.sin(angle);

    let minScale = 20;
    let width = Math.max(minScale/textInfo.scale/editorScale,scaleTextStart.width*distX/scaleTextStart.distX);
    let height = Math.max(minScale/textInfo.scale/editorScale,scaleTextStart.height*distY/scaleTextStart.distY);

    setInfo({...objectInfo,  ...{width:width,height:height} });
    setIsMoved(true);
  }

  const handleTouchMove = (e) => {
    if(isEditing){
      handleDragTwoFinger(e);
      if(isDragging && (document.getElementById(currentObject).contains(e.target)||document.getElementById(currentObject+'Tool').contains(e.target))) handleDragMove(e.nativeEvent.targetTouches[0]);
      else if(isScaling && e.target.dataset.type=='scale') handleScaleMove(e.nativeEvent.targetTouches[0])
      else if(isScalingText && e.target.dataset.type=='scaleText') handleScaleTextMove(e.nativeEvent.targetTouches[0])
   }
  } 

  const handleTouchStart = (e) => {
    if(isEditing){
      editor.addEventListener('touchmove',preventDefault, { passive: false });
      if(e.targetTouches.length==2){
        handleDragTwoFinger(e,true);
      }
      else if(touchCount==0){
        handleDragTwoFinger(e);
        if(e.target.dataset.type=='scale') handleScaleStart(e.nativeEvent.targetTouches[0]);
        else if(e.target.dataset.type=='scaleText') handleScaleTextStart(e.nativeEvent.targetTouches[0]);
        else if(document.getElementById(currentObject)&& ( document.getElementById(currentObject).contains(e.target)||document.getElementById(currentObject+'Tool').contains(e.target) ) && e.nativeEvent.targetTouches.length==1&&touchCount==0) handleDragStart(e.nativeEvent.targetTouches[0]);
      }
      else if(touchCount==1&&!isScaling){
        handleDragTwoFinger(e,true);
      }
      setTouchCount(touchCount+1);
    }
  }

  const handleDragTwoFinger = (e,start) => {
    let dragTwoFingerXY_ = dragTwoFingerXY;

    if(e.nativeEvent.targetTouches.length==1){
      if(!e.nativeEvent.targetTouches[0].target.classList.contains('editTextToggle')&&document.getElementById(currentObject)&& ( document.getElementById(currentObject).contains(e.nativeEvent.targetTouches[0].target) || document.getElementById(currentObject+'Tool').contains(e.nativeEvent.targetTouches[0].target)) ) dragTwoFingerXY_ = [{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY},dragTwoFingerXY[1]];    
      else dragTwoFingerXY_ = [dragTwoFingerXY[0],{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY}]; 
    }
    else if(e.nativeEvent.targetTouches.length==2){
      if(!e.nativeEvent.targetTouches[0].target.classList.contains('editTextToggle')&&document.getElementById(currentObject)&& ( document.getElementById(currentObject).contains(e.nativeEvent.targetTouches[0].target) || document.getElementById(currentObject+'Tool').contains(e.nativeEvent.targetTouches[0].target)) )  dragTwoFingerXY_ = [{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY},{x:e.nativeEvent.targetTouches[1].clientX,y:e.nativeEvent.targetTouches[1].clientY}];  
    }
    
    setDragTwoFingerXY(dragTwoFingerXY_);

    if(start && Object.keys(dragTwoFingerXY_[0]).length!=0) {
      setIsTwoFingerDragging(true);
      setDragTwoFingerStart({
        scale:objectInfo.scale,
        dist: Math.hypot(dragTwoFingerXY_[0].x-dragTwoFingerXY_[1].x,dragTwoFingerXY_[0].y-dragTwoFingerXY_[1].y)
      });
    }
  }

  useEffect(() => {
    if(isTwoFingerDragging) {
      let dist = Math.hypot(dragTwoFingerXY[0].x-dragTwoFingerXY[1].x,dragTwoFingerXY[0].y-dragTwoFingerXY[1].y);
      let scale = dragTwoFingerStart.scale*dist/dragTwoFingerStart.dist;
      setInfo({...objectInfo,  ...{scale:scale} });
      setIsMoved(true);
    }
  }, [dragTwoFingerXY]);

  const handleFlip = () => {
    if(isEditing){
      let iconInfo_ = {width:objectInfo.width,height:objectInfo.height,x:objectInfo.x,y:objectInfo.y,rot:objectInfo.rot,scale:objectInfo.scale,flip:!objectInfo.flip};
      setInfo(iconInfo_);
      saveStep(iconInfo_);
    }
  }
  
  const handleEnd = () => {
    if(isEditing){  
      editor.removeEventListener('touchmove',preventDefault, { passive: false });
      if(isMoved) {
        saveStep(objectInfo);
      }
      setIsScaling(false);
      setIsScalingText(false);
      setIsDragging(false);
      if(isTwoFingerDragging) {
        setDragTwoFingerStart({scale:1,dist:-1});
        setDragTwoFingerXY([{},{}]);
        setIsTwoFingerDragging(false);
      }
      setIsMoved(false);
      setTouchCount(0);
    }

    if(isDraggingTextSetting){
      setIsDraggingTextSetting(false);
    }
  }

  const handleDragTextSettingingStart = (ev) => {
    console.log('startt');
    setIsDraggingTextSetting(true);
    setDragTextSettingStart({
      x:ev.clientX,
      y:ev.clientY,
      startX:textSettingPos.x,
      startY:textSettingPos.y,
    });
  }

  const handleDragTextSettingingMove = (ev) => {
    if(isDraggingTextSetting){
      let x = ev.clientX - dragTextSettingStart.x;
      let y = ev.clientY - dragTextSettingStart.y;
      setTextSettingPos({x:dragTextSettingStart.startX+x,y:dragTextSettingStart.startY+y});
      console.log(x,y);
    }

  }

  const headObject = (
    <div>

      <div id='headObject' className='clickable object'
        style={{
          width:iconInfo.width*editorScale,
          height:iconInfo.height*editorScale,
          transform: `translate(${(iconInfo.x-iconInfo.width*0.5)*editorScale}px, ${(iconInfo.y-iconInfo.height*0.5)*editorScale}px) rotate(${iconInfo.rot}deg) scale(${iconInfo.scale})`,
          zIndex: frontObject=='headObject'? 99:0,
          pointerEvents:'none',
        }}
      >
        <div className='headImage' 
          style={status.mode=='admin'||currentIcon==null?{}:{transform: `scaleX(${iconInfo.flip?-1:1})`}}
        >
          <img src={status.mode=='admin'||currentIcon==null?placeHolderImage:currentIcon.url} />
          {status.mode=='admin'? <p style={{zIndex:5,fontSize:iconInfo.width*editorScale*0.1}}>移動此圖示</p>:null}
        </div>
      </div>


    {!status.view?
      <div id='headObjectTool' className={isEditing&&currentObject=='headObject'?'tools enabled clickable':'tools'} 
        style={{
          width:editorSize,
          height:editorSize*iconInfo.height/iconInfo.width,
          transform: `translate(${(iconInfo.x*editorScale-editorSize*0.5)}px, ${(iconInfo.y*editorScale-editorSize*iconInfo.height/iconInfo.width*0.5)}px) rotate(${iconInfo.rot}deg) scale(${iconInfo.width*iconInfo.scale/editorSize*editorScale})`,
          borderWidth:2/(iconInfo.width*iconInfo.scale/editorSize*editorScale),
          zIndex: frontObject=='headObject'? 99:0,
        }}
        onMouseOver={()=>{
          if(!status.view&&!isDragging&&!isScaling&&!isScalingText&&!isTwoFingerDragging){
            setCurrentObject('headObject');
            setFrontObject('headObject');
            setIsEditing(true);
          }
        }} 
        onMouseOut={()=>{
          if((!status.view&&!isDragging&&!isScaling&&!isScalingText)||isMobile) {
            setCurrentObject(null);
            setIsEditing(false);
            if(status.mode=='user')setFrontObject(null);
          }
        }}
      >
         
        <div class='dragClickArea' draggable="false" 
          style={{width:'100%',height:'100%'}} 
          onMouseDown={isMobile?null:(e)=>handleDragStart(e.nativeEvent)}
        />
        <div className="editButton topRightButton" data-type="scale" draggable="false" 
          style={{transform: `scale(${1/(iconInfo.width*iconInfo.scale/editorSize*editorScale)})`}}
          onMouseDown={isMobile?null:(e)=>handleScaleStart(e.nativeEvent)}
        >
          <div className="editButtonInner" style={{pointerEvents:'none'}}>
            <Icon path={mdiRotateLeft} size={0.6} color="white"/>
          </div>
        </div>

        {status.mode=='user'?(
          <>
            <div className="editButton bottomLeftButton" id='flipButton' draggable="false" 
              style={{transform: `scale(${1/(iconInfo.width*iconInfo.scale/editorSize*editorScale)})`}}
              onClick={isEditing?handleFlip:null}
            >
              <div className="editButtonInner">
                <Icon style={{pointerEvents:'none'}} path={mdiFlipHorizontal} size={0.6} color="white"/>
              </div>
            </div>

            <div className="editButton bottomRightButton" draggable="false" 
              style={{transform: `scale(${1/(iconInfo.width*iconInfo.scale/editorSize*editorScale)})`}}
              onClick={isEditing?()=>store.dispatch({type:'UNSELECT_ICON',id:imageSelected}):null}
            >
              <div className="editButtonInner" style={{pointerEvents:'none'}}>
                <Icon path={mdiDelete} size={0.6} color="white"/>
              </div>
            </div>
          </>
        ):null}


        {(iconTooBig||iconTooBig==null)&&status.mode=='user'&&!status.view?(
        <>
          <div className="headImageWarningContainer" style={{width: 40,height: 40,padding: 7,transform: `scale(${1/(iconInfo.width*iconInfo.scale/editorSize*editorScale)})`}}>
            <div className='headImageWarning' style={{borderRadius: 6}}>
              <Icon path={mdiExclamationThick} size={1.2} color="white"/>
            </div>

          {!isMobile?
            <div className='headImageWarningTextOuter' style={{left:20,top:50}}>
              <div className='headImageWarningText'>圖片超出原來大小，可能會模糊</div>
            </div>
          :null}

          </div>
        </>
      ):(null)}

      </div>

      :null}

      


    </div>
  );

  const textObject = (
    <>
    {textInfo!=null? 
    <div id='textObject' className='clickable textObject object'
      style={{
        width:textInfo.width*editorScale,
        height:textInfo.height*editorScale,
        transform: `translate(${(textInfo.x-textInfo.width*0.5)*editorScale}px, ${(textInfo.y-textInfo.height*0.5)*editorScale}px) rotate(${textInfo.rot}deg) scale(${textInfo.scale})`,
        zIndex: frontObject=='textObject'? 99:0,
        backgroundImage: currentImage==null||currentImage.textImage==null? 'none': 'url('+currentImage.textImage.url+')',
      }}
      onMouseOver={()=>{
        if(!isDragging&&!isScaling&&!isScalingText&&!isTwoFingerDragging){
          setCurrentObject('textObject');
          setFrontObject('textObject');
          setIsEditing(true);
        }
      }} 
      onMouseOut={(e)=>{
        if((!isDragging&&!isScaling&&!isScalingText&&!isMobile)||isMobile) {
          setCurrentObject(null);
          setIsEditing(false)
        }
      }}
    >
      <div className='textBox' style={{backgroundColor: isEditing&&frontObject=='textObject'? 'rgba(0,0,0,0.3)':'unset'}}>
  
        <div id='textObjectTool' className={(isEditing&&currentObject=='textObject')?'tools enabled ':'tools'} style={{borderWidth:2/textInfo.scale}}>
         
          <div class='dragClickArea' draggable="false" 
            style={{position:'absolute',width:'100%',height:'100%'}} 
            onMouseDown={isMobile?null:(e)=>handleDragStart(e.nativeEvent)}
          />
          
          <div class={isTextSetting||isTextLoading||currentImage.textLoading?'editTextToggle hidden':'editTextToggle'}
           style={{transform: `scale(${1/textInfo.scale})`}}
            // style={{...{transform: `scale(${1/textInfo.scale/editorScale})`},...isDragging||isTwoFingerDragging?{pointerEvents:'none'}:{}}}
            onClick={()=>{
              if(isMobile)store.dispatch({type:'SET_OVERLAY',mode:'titleSetting'});
              else {
                setTextSettingPos({x:textInfo.x*editorScale,y:textInfo.y*editorScale});
                setIsTextSetting(true)
              }
            }
          }>
            編輯
          </div>

          <div className="editButton topRightButton" data-type="scale" draggable="false" 
            style={{transform: `scale(${1/textInfo.scale})`}}
            onMouseDown={isMobile?null:(e)=>handleScaleStart(e.nativeEvent)}
          >
            <div className="editButtonInner" style={{pointerEvents:'none'}} >
              <Icon path={mdiRotateLeft} size={0.6} color="white"/>
            </div>
          </div>

          <div className="editButton bottomLeftButton" draggable="false" 
              style={{transform: `scale(${1/textInfo.scale})`}}
              onClick={isEditing?()=>{store.dispatch({type:'REMOVE_TEXT',id:imageSelected});setTextInfo(null);setIsTextSetting(false)}:null}
            >
              <div className="editButtonInner" style={{pointerEvents:'none'}}>
                <Icon path={mdiDelete} size={0.6} color="white"/>
              </div>
            </div>

          <div className="editButton bottomRightButton" data-type="scaleText" draggable="false" 
            style={{transform: `scale(${1/textInfo.scale})`}}
            onMouseDown={isMobile?null:(e)=>handleScaleTextStart(e.nativeEvent)}
          >
            <div className="editButtonInner" style={{pointerEvents:'none'}}>
              <Icon path={mdiArrowTopRightBottomLeftBold} size={0.6} color="white"/>
            </div>
          </div>
            
        </div>

        {isTextLoading||currentImage.textLoading?
            <div className='centerChildren' style={{pointerEvents:'none',transform:`scale(${0.3/textInfo.scale})`}}>
              <div className={'textLoader'}/>
            </div>
          :null} 

      </div>
    </div>
    :null}
    </>
  );

  let mouseMove = null;
  if(isDragging) mouseMove=handleDragMove;
  else if(isScaling) mouseMove=handleScaleMove;
  else if(isScalingText) mouseMove=handleScaleTextMove;
  else if(isDraggingTextSetting) mouseMove=handleDragTextSettingingMove;

  return (
    <div id="editorContainer" style={{"--button-size":isMobile?'40px':'30px'}}
      onMouseMove={!status.view&&!isMobile&&mouseMove? (e)=>mouseMove(e.nativeEvent):null} 
      onTouchMove={!status.view&&isMobile?handleTouchMove:null} 
      onMouseUp={!status.view&&isMobile?null:handleEnd}
      onTouchStart={!status.view&&isMobile?handleTouchStart:null}
      onTouchEnd={!status.view&&isMobile?handleEnd:null} 
    >

      {status.mode=='admin'&&overlay==null? 
        <div id="editorStartText" className={imageSelected!=-1?'fadeOut':null} >請上傳圖片</div>
      :null}

      {!status.view?
        <TopBar editor={true} stepEnabled={stepEnabled()} back={()=>{if(stepEnabled().back)stepMove('back')}} redo={()=>{if(stepEnabled().redo)stepMove('redo')}}/>
      :
        <div style={{width:'100%',height:40}}/>
      }

      {isMobile&&status.mode=='user'&&!status.view?
        <div style={{width:'100%',height:40,display:'flex',flexDirection:'row'}}>
          {oldEditorScale==null?
            <div style={{display:'flex',flexDirection:'row',marginLeft:'auto'}}>
              {currentIcon!=null?
                <Icon onClick={()=>zoom('icon')} path={mdiMagnifyPlusOutline} size={1.8} style={{marginLeft:5}} color="grey"/>
              :null}
            </div>
          :<Icon onClick={zoomReset} path={mdiMagnifyMinusOutline} size={1.8} style={{marginLeft:'auto'}} color="grey"/>
          }
        </div>
      :null}

      {isMobile&&iconTooBig&&status.mode=='user'&&!status.view?
        <div className='headImageWarningTextOuter' style={{top:70,opacity:1}}>
          <div className='headImageWarningText' style={{backgroundColor:'rgba(200,200,200,0.6)'}}>圖片超出原來大小，可能會模糊</div>
        </div>
      :null}
      
      {currentImage!=null?(
        <div id='editorWindow'>
          <div id='editorImage' className={isChanging?'changing': isZooming?'zooming':'' } style={{backgroundImage:'url('+currentImage.url+')',width:currentImage.width*editorScale,height:currentImage.height*editorScale,transform: `translate(${zoomOffset.x}px, ${zoomOffset.y}px)`}}>
            
            <div className='editorArea' style={{overflow:isEditing?'unset':'hidden'}}>

              {/* text */}
              {status.mode=='admin'&&textInfo!=null? <>{textObject}</>:null}

              {status.mode=='user'&&currentImage.textInfo!=null?
                <div className={status.view?'textObject object':'clickable textObject object'}
                  style={{
                    zIndex:isTextSetting?99:0,
                    width:currentImage.textInfo.width*editorScale,
                    height:currentImage.textInfo.height*editorScale,
                    transform: `translate(${currentImage.textInfo.x*editorScale-currentImage.textInfo.width*0.5*editorScale}px, ${currentImage.textInfo.y*editorScale-currentImage.textInfo.height*0.5*editorScale}px) rotate(${currentImage.textInfo.rot}deg)`,
                    backgroundImage: currentImage==null||currentImage.textInfo==null||currentImage.textImage==null? 'none': 'url('+currentImage.textImage.url+')',
                  }}
                  onClick={()=>{
                    if(!status.view){
                      if(isMobile)store.dispatch({type:'SET_OVERLAY',mode:'titleSetting'});
                      else {
                        setTextSettingPos({x:textInfo.x*editorScale,y:textInfo.y*editorScale});
                        setIsTextSetting(true)
                      }
                    }
                  }}>

                {!status.view && !isTextLoading && !currentImage.textLoading?
                  <div class='editTextToggle' style={{width:60,height:30,fontSize:16}}>
                    編輯
                  </div>
                :null}

                {isTextLoading||currentImage.textLoading?
                  <div className='centerChildren' style={{pointerEvents:'none',transform:`scale(${0.4})`}}>
                    <div className={'textLoader'}/>
                  </div>
                :null} 

                </div>
              :null}

              {/* head */}
              {status.mode=='admin' || (currentImage.iconSelected!=undefined && currentImage.iconSelected!=-1)? (
                <>{headObject}</>
              ):(
                <div className={'headImage'} 
                  style={{backgroundImage:`url(${placeHolderImage})`,width:PLACEHOLDER_SIZE*editorScale,height:PLACEHOLDER_SIZE*editorScale,transform: `translate(${(iconInfo.x-PLACEHOLDER_SIZE*0.5)*editorScale}px, ${(iconInfo.y-PLACEHOLDER_SIZE*0.5)*editorScale}px) rotate(${iconInfo.rot}deg) scale(${Math.max(iconInfo.width,iconInfo.height)*iconInfo.scale/PLACEHOLDER_SIZE})`}}
                >
                  <p style={{fontSize:PLACEHOLDER_SIZE*editorScale*0.1}}>請選擇頭像</p>
                </div>
              )}

            </div>

            {/* admin add text button */}
            {status.mode=='admin'&&textInfo==null? <div className='clickable addTextButton' onClick={addNewText}>新增文字</div> :null}
        
            {/* text setting */}
            {textInfo!=null && !isMobile &&isTextSetting?
              // <div className={isTextSetting?'textSetting object':'textSetting object hidden'}
              //   style={{
              //     transform: `translate(${textInfo.x*editorScale}px, ${textInfo.y*editorScale}px)`,     
              //   }}
              // >
              //   <TitleSetting on={isTextSetting} toggle={setIsTextSetting}/>
              // </div>
              <>
                <div className='titleSettingBackground'/>
                <div className='titleSettingContainer' style={{}}>
                  <TitleSetting pos={textSettingPos} dragStart={handleDragTextSettingingStart} on={isTextSetting} toggle={setIsTextSetting}/>
                </div>
              </>
            :null}

          </div>
        </div>
      ):(
        <div style={{flex:1}}/>
        )
      }

      {currentImage&&status.mode=='user'&&!status.demo&&!status.view&&display!='large'? (
        <div className='editorBottom'>
          <div className={currentImage.order>0?'pageArrow':'pageArrow disabled'} onClick={() => {if(currentImage.order>0){store.dispatch({type:'SELECT_IMAGE',id:images.find(image => image.order == currentImage.order-1).id});}}}>
            <Icon path={mdiArrowLeftBold} size={0.8} rotate={0} color="#DDDDDD" style={{transform:`translate(0px,0.5px)`}}/>
          </div>

          <div className='pageNumber borderBox'>第 {currentImage.order+1} 張</div>
          
          <div className={currentImage.order<images.length-1?'pageArrow':'pageArrow disabled'} onClick={() => {if(currentImage.order<images.length-1){store.dispatch({type:'SELECT_IMAGE',id:images.find(image => image.order == currentImage.order+1).id});}}}>
            <Icon path={mdiArrowLeftBold} size={0.8} color="#DDDDDD" style={{transform:`translate(0px,0.5px) rotate(180deg)`}}/>
          </div>
        </div>
      ):(null)}
      
    </div>
  );
}

export default Editor;
