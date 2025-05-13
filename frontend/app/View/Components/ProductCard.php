<?php

namespace App\View\Components;

use Illuminate\View\Component;

class ProductCard extends Component
{
    public $title;
    public $description;
    public $image;
    public $link;

    public function __construct($title = null, $description = null, $image = null, $link = null)
    {
        $this->title = $title;
        $this->description = $description;
        $this->image = $image;
        $this->link = $link;
    }

    public function render()
    {
        return view('components.product-card');
    }
}
