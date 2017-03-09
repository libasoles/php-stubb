<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Card;

class CardController extends Controller {

    function __construct() {
        
    }

    public function getAll() {
        return "list";
    }
    
    public function get(Card $card) {
        return "get";
    }
    
    public function save(Card $card = null) {
        return "save";
    }

}
