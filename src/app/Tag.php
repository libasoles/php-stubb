<?php
namespace App;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{

    public $timestamps = false;
    protected $fillable = ['name'];
    protected $hidden = ['pivot'];

    public function cards()
    {
        return $this->belongsToMany('App\Card');
    }

    public function scopeWithCards($query)
    {
        return $query->with(['cards' => function($query) {
                    $query->select('id');
                }]);
    }
}
