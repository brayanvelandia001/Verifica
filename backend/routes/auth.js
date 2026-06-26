const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

router.post("/login", async(req,res)=>{

    try{

        const {email,password}=req.body;

        if(!email || !password){

            return res.status(400).json({
                error:"Complete todos los campos"
            });

        }

        const usuario=await User.findOne({email});

        if(!usuario){

            return res.status(401).json({
                error:"Usuario no existe"
            });

        }

        const coincide=await bcrypt.compare(password,usuario.password);

        if(!coincide){

            return res.status(401).json({
                error:"Contraseña incorrecta"
            });

        }

        const token=jwt.sign({

            id:usuario._id,
            nombre:usuario.nombre,
            rol:usuario.rol

        },
        process.env.JWT_SECRET,
        {
            expiresIn:"8h"
        });

        res.json({

            token,

            usuario:{

                id:usuario._id,
                nombre:usuario.nombre,
                email:usuario.email,
                rol:usuario.rol

            }

        });

    }catch(err){

        console.log(err);

        res.status(500).json({

            error:"Error interno"

        });

    }

});

module.exports=router;