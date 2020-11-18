import api from './api';

export const Services = {
  get,
};

//get
function get(url,set) {
  api.get(url, {
  })
  .then((response) => {
    if(response.data.message=='Success') {
      if(set)set(response.data.data);
      // console.log(response.data.data.data);
    }
    // else if(errorFunc)errorFunc();
  }, (error) => {
    console.log(error);
    // if(errorFunc)errorFunc();
  });
}