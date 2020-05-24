import React, { Component } from 'react';
import Particles from 'react-particles-js';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

const particlesOptions = {
  particles: {
    number: {
      value: 60,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  boxAll: [],
  route: 'signin',
  isSignedIn: false,
  user : {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined    
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFaceAll = data.outputs[0].data.regions;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    const boxArr = clarifaiFaceAll.map(region => {
      return (
        {
          leftCol :  region.region_info.bounding_box.left_col * width,
          topRow :  region.region_info.bounding_box.top_row * height,
          rightCol : width - (region.region_info.bounding_box.right_col * width),
          bottomRow : height - (region.region_info.bounding_box.bottom_row * height)
        }
      )
    });
    return boxArr;
  }

  displayFaceBox = (boxAll) => {
    this.setState({boxAll: boxAll});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl: this.state.input});
    fetch('https://boiling-everglades-57883.herokuapp.com/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })          
    })
    .then(response => response.json())    
    .then(response => {
      if (response) {
        fetch('https://boiling-everglades-57883.herokuapp.com/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })          
        })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
          .catch(console.log)
      }
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const {isSignedIn, imageUrl, route, boxAll } = this.state;
      return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions}
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home'
          ? <div>
            <Logo />
            <Rank name={this.state.user.name} entries={this.state.user.entries}/>
            <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onButtonSubmit={this.onButtonSubmit}  
            />
            <FaceRecognition 
              imageUrl={imageUrl} 
              boxAll={boxAll} 
            />  
            </div>
          : (
              route === 'signin' 
              ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser}  />
              : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser}/>
            )
        }
      </div>
    );
  }
}

export default App;
