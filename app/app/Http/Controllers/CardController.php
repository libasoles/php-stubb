<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Card;

class CardController extends Controller {

    function __construct() {
        
    }

    public function getAll() {
        return Card::all();
    }
    
    public function get(Card $card) {
        return $card;
    }
    
    public function save(Card $card = null) {
        return "saved";
    }

    public function delete($id) {
        return "deleted";
    }
}
