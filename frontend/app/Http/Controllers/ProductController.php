<?php

namespace App\Http\Controllers;

class ProductController extends Controller
{
    public function showLoginForm()
    {
        return view('product.index');
    }
}