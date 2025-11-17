<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class MainController extends Controller
{
     public function login()
    {
        return view('login');
    }

    public function broadcast()
    {
        return view('broadcast');
    }

    public function contact()
    {
        return view('contact');
    }

    public function config()
    {
        return view('config');
    }

    public function kontakdb()
    {
        return view('kontakdb');
    }
}
