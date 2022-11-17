import App from './App'
import useGoogleLogin from './useGoogleLogin'
import {Button} from 'react-bootstrap'
import {useEffect, useState} from 'react'
import 'whatwg-fetch'
import Utils from './Utils'


export default function AppWrapper() {
    const googleLogin = useGoogleLogin({loginButtonId: 'loginwithgoogle', usePrompt: true})
    
    function logout() {
        googleLogin.logout()
        setUser(null)
        google.accounts.id.disableAutoSelect();
        window.location="/"
    }
    const [user,setUser] = useState(null)
    
    useEffect(function() {
       if (googleLogin.token)  {
           console.log('GOT TOKEN')
            var headers = {}
          	headers['Authorization'] = googleLogin.token
			var options = {}
            options['headers'] = headers
			fetch(Utils.devUriPrefix() + "/api/me", options).then(function(response) {
                  
                return response.json()
              }).then(function(json) {
                console.log('GOT TOKEN set user ',json)
                setUser(json)  
              
              }).catch(function(ex) {
                console.log('parsing failed', ex)
              })
       }
    },[googleLogin.token])
    
    return <>
    <div  style={{zIndex: 9999,position:'fixed', top: '10px', right: '10px'}} >
        <div id="loginwithgoogle" style={{display:!googleLogin.token ? 'block' : 'none'}} ><div id="loginwithgoogle" ></div></div>
        {googleLogin.token && <Button className="g_id_signout" onClick={logout} >Sign Out</Button>}
    </div>
    <App googleLogin={googleLogin} user={user} token={googleLogin.token} />
    </>
}
 // : <b>Loading</b>}</>
