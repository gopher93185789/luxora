<?php

namespace App\Http\Controllers;

class DbController extends Controller
{
    public function index()
    {
        return view('dashboard.index');
    }
}