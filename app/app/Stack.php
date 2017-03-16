<?php
namespace App;

use Illuminate\Database\Eloquent\Model;

class Stack extends Model
{

    protected $fillable = ['name', 'description', 'enabled'];
    protected $hidden = ['pivot'];

    public function cards()
    {
        return $this->belongsToMany('App\Card');
    }

    public function scopeLightweight($query)
    {
        return $query->with(['cards' => function($query) {
                    $query->select('id');
                }]);
    }
}
