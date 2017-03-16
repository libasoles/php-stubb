<?php
namespace App;

use App\Scopes\EnabledScope;
use Illuminate\Database\Eloquent\Model;

class Card extends Model
{

    protected $fillable = ['name', 'content', 'enabled'];

    protected $hidden = ['pivot'];
    
    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        static::addGlobalScope(new EnabledScope);
    }
    
    public function stack()
    {
        return $this->belongsToMany('App\Stack');
    }
}
