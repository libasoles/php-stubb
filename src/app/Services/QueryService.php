<?php
namespace App\Services;

use App\Stack;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;

/**
 * TODO: filter by key word
 */
class QueryService
{

    private $model;
    private $request;
    private $config;
    
    function __construct(Request $request, $config)
    {
        $this->request = $request;
        $this->config = $config;
    }
    
    private function retrieve()
    {

        // query 
        $query = $this->model->cards()->with('tags')
            ->orderBy('sticky', 'desc');

        // apply order
        if ($this->request->get('order')) {

            $order = json_decode($this->request->get('order'));
            $query->orderBy($order->order, $order->direction);
        }

        // retrieve results with pagination
        $data = $query->paginate(Config::get('app.results_per_page'));
    
        return $data;
    }

    public function search()
    {
        // apply order
        if ($this->request->get('stack') !== null) {

            return $this->searchByStack();
        } else {
            
            $this->model = auth('api')->user(); // set model   
            return $this->retrieve();
        }
    }

    public function searchByStack($stack_id = null)
    {           
        // read cookie
        $stack = json_decode($this->request->get('stack'));
        $stack_id = $stack_id ?? $stack; // from URL or COOKIE
        $stack = Stack::findOrFail($stack_id);

        // current user must by the owner of the stack
        auth('api')->user()->can('ownership', $stack);

        $this->model = $stack; // set model
        
        return $this->retrieve();
    }
    
    public function searchByTags()
    {
        return $this->search();
    }
}
