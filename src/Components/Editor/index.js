import './style.css';
import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import {isMobile} from 'react-device-detect';
import {Services} from '../../services';

import TopBar from '../../Components/TopBar';
import Icon from '@mdi/react'
import TitleSetting from '../../Components/TitleSetting';
import { mdiExclamationThick } from '@mdi/js';
import { mdiFlipHorizontal } from '@mdi/js';
import { mdiDelete } from '@mdi/js';
import { mdiArrowLeftBold } from '@mdi/js';
import { mdiRotateLeft } from '@mdi/js';
import { mdiArrowTopRightBottomLeftBold } from '@mdi/js';

import placeHolderImage from '../../placeHolderImage.png';

const PLACEHOLDER_SIZE = 350;
// let PLACEHOLDER_SCALE = 0.1;
// let EDIT_ICON_SCALE = 0.01;

function Editor(props) {
  // if(isMobile) {
  //   PLACEHOLDER_SIZE = 150;
  // }

  const status = useSelector(state => state.status);
  const screen = useSelector(state => state.screen);
  const display = useSelector(state => state.display);
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);
  const icons = useSelector(state => state.icons);

  const [editorScale,setEditorScale] = useState(1);
  const [textColor,setTextColor] = useState('#000000');

  const [currentObject,setCurrentObject] = useState(null);
  const [frontObject,setFrontObject] = useState('headObject');
  const [iconInfo,setIconInfo] = useState({width:PLACEHOLDER_SIZE,height:PLACEHOLDER_SIZE,x:0,y:0,rot:0,scale:1,flip:false});
  const [textInfo,setTextInfo] = useState(null);

  const [dragStart,setDragStart] = useState({});
  const [scaleStart,setScaleStart] = useState({});
  const [scaleTextStart,setScaleTextStart] = useState({});
  const [dragTwoFingerXY,setDragTwoFingerXY] = useState([{},{}]);
  const [dragTwoFingerStart,setDragTwoFingerStart] = useState({scale:1,dist:-1});
  const [touchCount,setTouchCount] = useState(0);

  const [isEditing,setIsEditing] = useState(false);
  const [isDragging,setIsDragging] = useState(false);
  const [isMoved,setIsMoved] = useState(false);
  const [isScaling,setIsScaling] = useState(false);
  const [isScalingText,setIsScalingText] = useState(false);
  const [isTwoFingerDragging,setIsTwoFingerDragging] = useState(false);
  const [isChanging,setIsChanging] = useState(false);
  const [isTextSetting,setIsTextSetting] = useState(false);

  const editor = document.getElementById('editorWindow');
  if(editor) editor.addEventListener('touchmove', e => {
      e.preventDefault();
  }, { passive: false });

  const currentImage = imageSelected==-1? null:images.find(image => image.id == imageSelected);
  const currentImageIndex = imageSelected==-1? null:images.findIndex(image => image.id == imageSelected);
  const currentIcon = imageSelected==-1 || currentImage.iconSelected==-1? null:icons.find(icon=>icon.id==currentImage.iconSelected); 

  useEffect(() => {
    if(currentImageIndex==null&&images.length>0) {
      store.dispatch({type:'SELECT_IMAGE',id:images[0].id});
    }
  }, [images]);
 
  useEffect(() => {
    updateImageSize();
  }, [screen]);

  useEffect(() => {
    if(imageSelected!=-1) {
      setIsChanging(true);
      setTimeout(()=> {
        setIsChanging(false);
        updateImageSize();
        updateEditorIconInfo();
        updateEditorTextInfo();
      }, 200);
    }
    setIsTextSetting(false);
  }, [imageSelected]);

  useEffect(() => {
    if(currentIcon!=null) {
      setIsEditing(false);
      updateEditorIconInfo();
    }
    else if(imageSelected!=-1){
      // store.dispatch({type:'UPDATE_STEP',step:null,id:imageSelected});
    }
  }, [currentIcon]);

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
      iconInfo = currentImage.iconInfo;
      iconInfo.width = PLACEHOLDER_SIZE;
      iconInfo.height = PLACEHOLDER_SIZE;
      iconInfo.scale = iconInfo.size[1]/iconInfo.width;
      saveStep(iconInfo,'headObject',true);
      setIconInfo(iconInfo);
    }
    else if (status.mode=='user' && currentIcon!=null) {
      iconInfo = currentImage.iconInfo;
      iconInfo.scale *= (iconInfo.width/currentIcon.width + iconInfo.height/currentIcon.height)*0.5;
      iconInfo.width = currentIcon.width;
      iconInfo.height = currentIcon.height;
      iconInfo.flip = false;
      saveStep(iconInfo,'headObject',true);
      setIconInfo(iconInfo);
    }   
  }

  const updateEditorTextInfo = () => {
    if(currentImage.textInfo!=null){
      saveStep(currentImage.textInfo,'textObject',true);
    }
    setTextInfo(currentImage.textInfo);
  }

  const addNewText = () => {
    if(textInfo==null){
      let TEXT_DISPLAY_WIDTH = screen.screenWidth>768? 350:150;
      let TEXT_WIDTH = 2000;
      let TEXT_HEIGHT = 1000;
      let textInfo = {
        rot: -20,
        scale: TEXT_DISPLAY_WIDTH/TEXT_WIDTH/editorScale,
        width: TEXT_WIDTH,
        height: TEXT_HEIGHT,
      };
      textInfo.x = TEXT_WIDTH*textInfo.scale*0.5 + 40/editorScale;
      textInfo.y = TEXT_HEIGHT*textInfo.scale*0.5 + 70/editorScale;
    
      setTextInfo(textInfo);
      saveStep(textInfo,'textObject',true);

      Services.adminUpdatePhotos(
        [currentImage],
        () => setTimeout(Services.titleToImage(imageSelected,"This is {**Customer_INPUT**}'s Album"),300),
        // Services.titleToImage(imageSelected,"This is {**Customer_INPUT**}'s Album"),
        '#000000'
      );
    }
  }

  const updateImageSize = () => {
    if(imageSelected!=-1){
      let editorHeight = document.getElementById('editorWindow').clientHeight;
      let editorWidth = document.getElementById('editorWindow').clientWidth;

      let ratio = currentImage.width / currentImage.height;
      let editorRatio = editorWidth/editorHeight;
      let editorScale;

      if(ratio>editorRatio) {
        editorScale = editorWidth/currentImage.width;
      }
      else {
        editorScale = editorHeight/currentImage.height;
      }

      setEditorScale(editorScale);
      return editorScale;
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
      let step = currentImage.step; 

      if(step.store.find(x=>x.object==object).objectInfo==null){
        step.store.find(x=>x.object==object).objectInfo = objectInfo;
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
    let step = currentImage.step; 
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
    let x = ev.clientX - scaleStart.centerX;
    let y = ev.clientY - scaleStart.centerY; 
    let scale = scaleStart.scale*Math.hypot(x,y)/scaleStart.dist;
    if (objectInfo.width*scale*editorScale < 60 || objectInfo.height*scale*editorScale < 60) scale = Math.max(60/objectInfo.width/editorScale,60/objectInfo.height/editorScale);  
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

    let width = Math.max(50/textInfo.scale/editorScale,scaleTextStart.width*distX/scaleTextStart.distX);
    let height = Math.max(50/textInfo.scale/editorScale,scaleTextStart.height*distY/scaleTextStart.distY);

    setInfo({...objectInfo,  ...{width:width,height:height} });
    setIsMoved(true);
  }

  const handleTouchMove = (e) => {
    if(isEditing){
      let button = e.target.querySelector('.editButton');
      handleDragTwoFinger(e);
      if(isDragging && document.getElementById(currentObject).contains(e.target))handleDragMove(e.nativeEvent.targetTouches[0]);
      else if(isScaling && e.target.dataset.type=='scale') handleScaleMove(e.nativeEvent.targetTouches[0])
      else if(isScalingText && e.target.dataset.type=='scaleText') handleScaleTextMove(e.nativeEvent.targetTouches[0])
   }
  } 

  const handleTouchStart = (e) => {
    if(isEditing){
      if(e.targetTouches.length==2){
        handleDragTwoFinger(e,true);
      }
      else if(touchCount==0){
        handleDragTwoFinger(e);
        if(e.target.dataset.type=='scale') handleScaleStart(e.nativeEvent.targetTouches[0]);
        else if(e.target.dataset.type=='scaleText') handleScaleTextStart(e.nativeEvent.targetTouches[0]);
        else if(document.getElementById(currentObject).contains(e.target)&& e.nativeEvent.targetTouches.length==1&&touchCount==0) handleDragStart(e.nativeEvent.targetTouches[0]);
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
      if(document.getElementById(currentObject)&&document.getElementById(currentObject).contains(e.nativeEvent.targetTouches[0].target)) dragTwoFingerXY_ = [{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY},dragTwoFingerXY[1]];    
      else dragTwoFingerXY_ = [dragTwoFingerXY[0],{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY}]; 
    }
    else if(e.nativeEvent.targetTouches.length==2){
      if(document.getElementById(currentObject)&&document.getElementById(currentObject).contains(e.nativeEvent.targetTouches[0].target)) dragTwoFingerXY_ = [{x:e.nativeEvent.targetTouches[0].clientX,y:e.nativeEvent.targetTouches[0].clientY},{x:e.nativeEvent.targetTouches[1].clientX,y:e.nativeEvent.targetTouches[1].clientY}];  
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
      if(isMoved) {
        saveStep(objectInfo);
      }
      else if(isDragging){
        if(frontObject=='textObject')setIsTextSetting(!isTextSetting);
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
  }

  const headObject = (
    <div id='headObject' className='object'
      style={{
        width:iconInfo.width,
        height:iconInfo.height,
        transform: `translate(${iconInfo.x-iconInfo.width*0.5}px, ${iconInfo.y-iconInfo.height*0.5}px) rotate(${iconInfo.rot}deg) scale(${iconInfo.scale})`,
        zIndex: frontObject=='headObject'? 99:0,
      }}
      onMouseEnter={()=>{
        if(!isDragging&&!isScaling&&!isScalingText&&!isTwoFingerDragging){
          setCurrentObject('headObject');
          setFrontObject('headObject');
          setIsEditing(true);
        }
      }} 
      onMouseLeave={()=>{
        if((!isDragging&&!isScaling&&!isScalingText)||isMobile) {
          setCurrentObject(null);
          setIsEditing(false);
        }
      }}
    >
      <div className='headImage' 
        style={status.mode=='admin'||currentIcon==null?{backgroundImage:`url(${placeHolderImage})`}:{backgroundImage:'url('+currentIcon.url+')',transform: `scaleX(${iconInfo.flip?-1:1})`}}
      >
        {status.mode=='admin'? <p style={{fontSize:iconInfo.width*0.1}}>移動此圖示</p>:null}
      </div>

      {iconInfo.scale>1&&status.mode=='user'?(
        <div className="headImageWarningContainer" style={{width: 40/iconInfo.scale/editorScale,height: 40/iconInfo.scale/editorScale,padding: 10/iconInfo.scale/editorScale}}>
          <div className='headImageWarning' style={{borderRadius: 6/iconInfo.scale/editorScale}}>
            <Icon path={mdiExclamationThick} size={1.2/iconInfo.scale/editorScale} color="white"/>
          </div>
        </div>
      ):(null)}

      <div className={isEditing&&currentObject=='headObject'?'tools enabled ':'tools'} style={{borderWidth:1.5/iconInfo.scale/editorScale}}>
        <div class='dragClickArea' draggable="false" 
          style={{width:'100%',height:'100%'}} 
          onMouseDown={isMobile?null:(e)=>handleDragStart(e.nativeEvent)}
        />
        <div className="editButton topRightButton" data-type="scale" draggable="false" 
          style={{transform: `scale(${1/iconInfo.scale/editorScale})`}}
          onMouseDown={isMobile?null:(e)=>handleScaleStart(e.nativeEvent)}
        >
          <div className="editButtonInner" style={{pointerEvents:'none'}}>
            <Icon path={mdiRotateLeft} size={1} color="white"/>
          </div>
        </div>
        {status.mode=='user'?(
          <>
            <div className="editButton bottomLeftButton" id='flipButton' draggable="false" 
              style={{transform: `scale(${1/iconInfo.scale/editorScale})`}}
              onClick={isEditing?handleFlip:null}
            >
              <div className="editButtonInner">
                <Icon style={{pointerEvents:'none'}} path={mdiFlipHorizontal} size={1} color="white"/>
              </div>
            </div>

            <div className="editButton bottomRightButton" draggable="false" 
              style={{transform: `scale(${1/iconInfo.scale/editorScale})`}}
              onClick={isEditing?()=>store.dispatch({type:'UNSELECT_ICON',id:imageSelected}):null}
            >
              <div className="editButtonInner" style={{pointerEvents:'none'}}>
                <Icon path={mdiDelete} size={1} color="white"/>
              </div>
            </div>
          </>
        ):null}
      </div>

    </div>
  );

  const textObject = (
    <>
    {textInfo!=null? 
    <div id='textObject' className='textObject object'
      style={{
        width:textInfo.width,
        height:textInfo.height,
        transform: `translate(${textInfo.x-textInfo.width*0.5}px, ${textInfo.y-textInfo.height*0.5}px) rotate(${textInfo.rot}deg) scale(${textInfo.scale})`,
        zIndex: frontObject=='textObject'? 99:0,
        backgroundImage: currentImage==null||currentImage.textImage==null? 'none': 'url('+currentImage.textImage.url+')',
      }}
      onMouseEnter={()=>{
        if(!isDragging&&!isScaling&&!isScalingText&&!isTwoFingerDragging){
          setCurrentObject('textObject');
          setFrontObject('textObject');
          setIsEditing(true);
        }
      }} 
      onMouseLeave={()=>{
        if((!isDragging&&!isScaling&&!isScalingText)||isMobile) {
          setCurrentObject(null);
          setIsEditing(false)
        }
      }}
    >
      <div className='textBox' style={{backgroundColor: isEditing&&frontObject=='textObject'? 'rgba(0,0,0,0.3)':'unset'}}>
  
        <div className={isEditing&&currentObject=='textObject'?'tools enabled ':'tools'} style={{borderWidth:1.5/textInfo.scale/editorScale}}>
          <div class='dragClickArea' draggable="false" 
            style={{width:'100%',height:'100%'}} 
            onMouseDown={isMobile?null:(e)=>handleDragStart(e.nativeEvent)}
          />
          <div className="editButton topRightButton" data-type="scale" draggable="false" 
            style={{transform: `scale(${1/textInfo.scale/editorScale})`}}
            onMouseDown={isMobile?null:(e)=>handleScaleStart(e.nativeEvent)}
          >
            <div className="editButtonInner" style={{pointerEvents:'none'}} >
              <Icon path={mdiRotateLeft} size={1} color="white"/>
            </div>
          </div>

          <div className="editButton bottomLeftButton" draggable="false" 
              style={{transform: `scale(${1/textInfo.scale/editorScale})`}}
              onClick={isEditing?()=>{store.dispatch({type:'REMOVE_TEXT',id:imageSelected});setTextInfo(null)}:null}
            >
              <div className="editButtonInner" style={{pointerEvents:'none'}}>
                <Icon path={mdiDelete} size={1} color="white"/>
              </div>
            </div>

          <div className="editButton bottomRightButton" data-type="scaleText" draggable="false" 
            style={{transform: `scale(${1/textInfo.scale/editorScale})`}}
            onMouseDown={isMobile?null:(e)=>handleScaleTextStart(e.nativeEvent)}
          >
            <div className="editButtonInner" style={{pointerEvents:'none'}}>
              <Icon path={mdiArrowTopRightBottomLeftBold} size={0.7} color="white"/>
            </div>
          </div>
            
        </div>

      </div>
    </div>
    :null}
    </>
  );

  let mouseMove = null;
  if(isDragging) mouseMove=handleDragMove;
  else if(isScaling) mouseMove=handleScaleMove;
  else if(isScalingText) mouseMove=handleScaleTextMove;

  return (
    <div id="editorContainer" style={{"--button-size":isMobile?'40px':'30px'}}
      onMouseMove={!isMobile&&mouseMove? (e)=>mouseMove(e.nativeEvent):null} 
      onTouchMove={isMobile?handleTouchMove:null} 
      onMouseUp={isMobile?null:handleEnd}
      onTouchStart={isMobile?handleTouchStart:null}
      onTouchEnd={isMobile?handleEnd:null} 
    >

      {status.mode=='admin'? 
        <div id="editorStartText" className={imageSelected!=-1?'fadeOut':null} >請上傳圖片</div>
      :null}

      <TopBar stepEnabled={stepEnabled()} back={()=>{if(stepEnabled().back)stepMove('back')}} redo={()=>{if(stepEnabled().redo)stepMove('redo')}}/>
      
      {currentImage!=null?(
        <div id='editorWindow'>
          <div id='editorImage' className={isChanging?'changing':null} style={{backgroundImage:'url('+currentImage.url+')',width:currentImage.width,height:currentImage.height,transform: `scale(${editorScale})`}}>
            
            {/* text setting */}
            {textInfo!=null?
              <div className={isTextSetting?'textSetting object':'textSetting object hidden'}
                style={{
                  transform: `translate(${textInfo.x}px, ${textInfo.y}px) scale(${1/editorScale})`,     
                }}
              >
                <TitleSetting color={textColor} title={currentImage.textInfo==null?'':currentImage.textInfo.title} onChange={(color)=>setTextColor(color)} on={isTextSetting} toggle={setIsTextSetting} />
              </div>
            :null}

            <div className='editorOverflowContainer'>

              {/* text */}
              {status.mode=='admin'&&textInfo!=null? <>{textObject}</>:null}
              {status.mode=='user'&&textInfo!=null? 
                <div className='textObject object' 
                  style={{
                    width:currentImage.textInfo.width,
                    height:currentImage.textInfo.height,
                    transform: `translate(${currentImage.textInfo.x-currentImage.textInfo.width*0.5}px, ${currentImage.textInfo.y-currentImage.textInfo.height*0.5}px) rotate(${currentImage.textInfo.rot}deg)`,
                    backgroundImage: currentImage==null||currentImage.textInfo==null||currentImage.textImage==null? 'none': 'url('+currentImage.textImage.url+')',
                  }}
                  onClick={()=>setIsTextSetting(!isTextSetting)}
                >
                  {/* <input className='textInput' type="text" id="fname" name="fname"></input> */}
                </div>
              :null}

              {/* head */}
              {status.mode=='admin' || (currentImage.iconSelected!=undefined && currentImage.iconSelected!=-1)? (
                <>{headObject}</>
              ):(
                <div className={currentImage.iconSelected && currentImage.iconSelected!=-1? 'headImage hidden' : 'headImage'} 
                  style={{backgroundImage:`url(${placeHolderImage})`,width:PLACEHOLDER_SIZE,height:PLACEHOLDER_SIZE,transform: `translate(${currentImage.iconInfo.x-PLACEHOLDER_SIZE*0.5}px, ${currentImage.iconInfo.y-PLACEHOLDER_SIZE*0.5}px) rotate(${currentImage.iconInfo.rot}deg) scale(${currentImage.iconInfo.size[0]/PLACEHOLDER_SIZE})`}}
                >
                  <p style={{fontSize:currentImage.iconInfo.width*0.1}}>請選擇頭像</p>
                </div>
              )}

            </div>

            {status.mode=='admin'&&textInfo==null? <div className='addTextButton' style={{transform:`scale(${1/editorScale}`}} onClick={addNewText}>新增文字</div> :null}
        
          </div>
        </div>
      ):(
        <div style={{flex:1}}/>
        )
      }

      {status.mode=='user' && display!='large' ? (
        <div className='editorBottom'>
          <div className={currentImageIndex>0?'pageArrow':'pageArrow disabled'} onClick={() => {if(currentImageIndex>0){store.dispatch({type:'SELECT_IMAGE',id:images[currentImageIndex-1].id});}}}>
            <Icon path={mdiArrowLeftBold} size={0.8} rotate={0} color="#DDDDDD" style={{transform:`translate(0px,0.5px)`}}/>
          </div>

          <div className='pageNumber borderBox'>第 {currentImageIndex+1} 張</div>
          
          <div className={currentImageIndex<images.length-1?'pageArrow':'pageArrow disabled'} onClick={() => {if(currentImageIndex<images.length-1){store.dispatch({type:'SELECT_IMAGE',id:images[currentImageIndex+1].id});}}}>
            <Icon path={mdiArrowLeftBold} size={0.8} color="#DDDDDD" style={{transform:`translate(0px,0.5px) rotate(180deg)`}}/>
          </div>
        </div>
      ):(null)}
      
    </div>
  );
}

export default Editor;
