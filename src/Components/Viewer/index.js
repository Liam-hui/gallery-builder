import './style.css';
import React, { useState, useEffect, useCallback, useRef} from 'react';
import { useSelector } from "react-redux";
import store from '../../store';
import {isMobile} from 'react-device-detect';
import {Services} from '../../services';

import placeHolderImage from '../../placeHolderImage.png';

function Viewer(props) {

  const {viewerMode,scroll} = props;

  const init = useSelector(state => state.init);
  const status = useSelector(state => state.status);
  const screen = useSelector(state => state.screen);
  const overlay = useSelector(state => state.overlay);
  const images = useSelector(state => state.images);
  const imageSelected = useSelector(state => state.imageSelected);
  const icons = useSelector(state => state.icons);


  const [currentSelectedId,setCurrentSelectedId] = useState(-1);
  const [containerScale,setcontainerScale] = useState(null);
  const [isChanging,setIsChanging] = useState(false);

  const currentImage = currentSelectedId==-1? null:images.find(image => image.id == currentSelectedId);

  useEffect(() => {
    if(viewerMode){
      if(overlay.mode=='loading'&&images.length==init.images&&!images.some(x=>x.loading||x.deleting)) {
        if(status.mode=='user'&&status.isFirst) store.dispatch({type:'SET_OVERLAY',mode:'init'});
        else store.dispatch({type:'CLOSE_OVERLAY'});
      }

      if(imageSelected==-1&&images.length>0) {
        if(images.find(image => image.order == 0) && !images.find(image => image.order == 0).loading) store.dispatch({type:'SELECT_IMAGE',id:images.find(image => image.order == 0).id});
      }
    }
  }, [images]);
 
  useEffect(() => {
    if(!scroll) updateImageSize();
  }, [screen]);

  useEffect(() => {
    if(imageSelected!=-1) {
      setIsChanging(true);
      setTimeout(()=> {
        setCurrentSelectedId(imageSelected);
      }, 200);
    }
  }, [imageSelected]);

  useEffect(() => {
    if(!isMobile&&!scroll&&currentSelectedId!=-1) {
        updateImageSize();
        setIsChanging(false);
    }
  }, [currentSelectedId]);

  const updateImageSize = () => {
    if(imageSelected!=-1){
      let containerHeight = document.getElementById('viewerWindow').clientHeight;
      let containerWidth = document.getElementById('viewerWindow').clientWidth;

      let ratio = currentImage.width / currentImage.height;
      let containerRatio =  containerWidth/containerHeight;
      let containerScale;

      if(ratio>containerRatio) {
        containerScale = containerWidth/currentImage.width;
      }
      else {
        containerScale = containerHeight/currentImage.height;
      }

      setcontainerScale(containerScale);
    }
  }

  const viewerImage = (currentImage,containerScale) => {
    const currentIcon = currentSelectedId==-1 || (currentImage!=null&&currentImage.iconSelected==-1)? null:icons.find(icon=>icon.id==currentImage.iconSelected); 
    
    return(
      <div className={isChanging?'viewerImage changing':'viewerImage'} style={{backgroundImage:'url('+currentImage.url+')',width:currentImage.width*containerScale,height:currentImage.height*containerScale}}> 
        <div className='editorArea'>

          {currentImage.textInfo!=null?
            <div className='textObject object'
              style={{
                width:currentImage.textInfo.width*containerScale,
                height:currentImage.textInfo.height*containerScale,
                transform: `translate(${currentImage.textInfo.x*containerScale-currentImage.textInfo.width*0.5*containerScale}px, ${currentImage.textInfo.y*containerScale-currentImage.textInfo.height*0.5*containerScale}px) rotate(${currentImage.textInfo.rot}deg)`,
                backgroundImage: currentImage==null||currentImage.textInfo==null||currentImage.textImage==null? 'none': 'url('+currentImage.textImage.url+')',
              }}
            />
          :null}

          {currentImage.iconInfo!=null?
            <div id='headObject' className='object'
              style={{
                zIndex:'unset',
                width:currentImage.iconInfo.width*containerScale,
                height:currentImage.iconInfo.height*containerScale,
                transform: `translate(${(currentImage.iconInfo.x-currentImage.iconInfo.width*0.5)*containerScale}px, ${(currentImage.iconInfo.y-currentImage.iconInfo.height*0.5)*containerScale}px) rotate(${currentImage.iconInfo.rot}deg) scale(${currentImage.iconInfo.scale})`,
              }}
            >
              <div className='headImage' 
                style={{transform: `scaleX(${currentImage.iconInfo.flip?-1:1})`}}
              >
                <img src={currentIcon==null?placeHolderImage:currentIcon.url} />
              </div>
            </div>
          :null}

        </div>
      </div>
    );
  }

  const mobileViewerImage = (image) => {

    let containerScale;
    let ratio = image.width / image.height;

    let containerWidth = document.getElementById('gallery-builder-root').clientWidth;
    let containerHeight = containerWidth/ratio;

    containerScale = containerWidth/image.width;

    return(
      <div className='photoViewContainer' style={{height:containerHeight}}>
        {viewerImage(image,containerScale)}
        <div className='photoText'>{image.order==0?'封面':'第'+image.order+'頁'}</div>
      </div>
    );

  }

  if(!scroll) return (
    <div id="viewerContainer">

      {currentImage!=null?(
        <div id='viewerWindow'>
          {viewerImage(currentImage,containerScale)}
        </div>
      ):(
        <div style={{flex:1}}/>
        )
      }
      
    </div>
  );

  else return(
    <>
      {status.userView?
        <div className='viewerTopBar'>
          <label className='clickable borderBox' onClick={()=>Services.userUpdatePhotos(images,1)} >完成</label>
          <label className='clickable borderBox' onClick={()=> store.dispatch({type:'SHOW_VIEW_BACK'})}>返回</label>
        </div>
      :null}

      <div id="viewerScrollContainer">
          {images.sort(function (a, b) {
            return a.order - b.order;
          }).map(image=>(
            <>
              {mobileViewerImage(image)}
            </>
          ))}
      </div>
    </>
  );
}

export default Viewer;
