<?php
namespace App;

use Illuminate\Database\Eloquent\Model;

class Card extends Model
{

    protected $fillable = ['name', 'content', 'enabled'];

    protected $hidden = ['pivot'];
    
    public function stack()
    {
        return $this->belongsToMany('App\Stack');
    }
}
