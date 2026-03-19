import React, { useState, useEffect } from "react";
import { useParams, useNavigate} from "react-router-dom";
import axios from 'axios';

  export default function Update() {
   
    const {id} = useParams()
    const [name, setName] = useState()
    const [email, setEmail] = useState()
    const [num, setNum] = useState()
    const [city, setCity] = useState()
    const [uname, setUname] = useState()
    const [pass, setPass] = useState()
    const [conpass, setConpass] = useState()

    const navigate = useNavigate()

    useEffect(() => {
<<<<<<< HEAD
      axios.get("import.meta.env.VITE_API_URL/Admin/getUser/"+id)
=======
      axios.get("import.meta.env.VITE_API_URL/Admin/getUser/"+id)
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
        .then(result =>{ 
          console.log(result)
          setName(result.data.name)
          setEmail(result.data.email)
          setNum(result.data.num)
          setCity(result.data.city)
          setUname(result.data.uname)
          setPass(result.data.pass)
        
        
        })
        .catch(err => console.log(err));
    }, []);

    const Update = (e) =>{
      e.preventDefault()
<<<<<<< HEAD
      axios.put("import.meta.env.VITE_API_URL/Update/"+id, {name,email,num,city,uname,pass,conpass})
=======
      axios.put("import.meta.env.VITE_API_URL/Update/"+id, {name,email,num,city,uname,pass,conpass})
>>>>>>> 9a6e6a0cd91a21814504d1c7ca7d99642391e9b9
      .then(result => {
        console.log(result)
        navigate('/Admin')
      })
      .catch(err => console.log(err))
    }

  return (
    <>
      <div className="containerF">
       
        <div className="right-section">
          <h1>Update</h1>
          <form id="contact-form" className="contact-form" onSubmit={Update} >

            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" required=""  value={name} onChange={(e)=> setName(e.target.value)}/>

            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" required=""   value={email} onChange={(e)=> setEmail(e.target.value)} />

            <label htmlFor="num">Mobile Number:</label>
            <input type="text" id="num " name="num" required=""  value={num} onChange={(e)=> setNum(e.target.value)} />

            <label htmlFor="city">City:</label>
            <input type="text" id="city " name="city" required=""  value={city} onChange={(e)=> setCity(e.target.value)} />

            <label htmlFor="uname">Username:</label>
            <input type="text" id="uname " name="uname" required=""  value={uname}  onChange={(e)=> setUname(e.target.value)} />

            <label htmlFor="password">Password</label>
            <input type="text" id="password" name="password" required=""  value={pass} onChange={(e)=> setPass(e.target.value)} />
           
            <button type="submit">Update</button>
          </form>
        </div>
      </div>
    </>
  );
}
