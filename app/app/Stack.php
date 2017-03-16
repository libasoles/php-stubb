<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Stack extends Model
{
    protected $fillable = ['name', 'description', 'enabled'];
    
    public function cards()
    {
        return $this->belongsToMany('App\Card');
    }
}
