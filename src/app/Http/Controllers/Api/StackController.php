<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Stack;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StackController extends Controller
{

    /**
     * Display a listing of the stacks.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $data = [];
        
        try {

            $data = Stack::all();
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            abort(500, 'There was an error retrieving the records'); 
        }

        return $data;
    }

    /**
     * Get a single Stack
     * 
     * Lightweight version will not return cards info apart from the id
     * 
     * @param Request $request
     * @param int $id
     * @return json
     */
    public function show(Request $request, int $id)
    {
        $data = [];
        
        try {

            $lightweight = filter_input(INPUT_GET, 'lightweight', FILTER_VALIDATE_BOOLEAN);

            if ($lightweight) {

                // retrieving lightweight data from DB
                $data = Stack::lightweight()->findOrFail($id);

                $cards = $data->cards->pluck('id')->all();
           
                // replacing object data with grouped lightweight data
                $data = $data->toArray();
            } else {

                $data = Stack::with('cards')->findOrFail($id)->toArray();
            }

        } catch (ModelNotFoundException $e) {
            abort(500, 'Not found'); 
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            abort(500, 'There was an error retrieving the record');
        }

        return $data;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        try {

            // validation
            $this->validate($request, [
                'name' => 'bail|required|max:255'
            ]);

            // new record                
            $stack = new Stack;            
            $stack->name = $request->input('name');
            $stack->description = $request->input('description');
            $stack->enabled = true;

            $stack->save();

        } catch (\Exception $exc) {
            abort(500, 'There was an error creating the record');
            Log::error(get_class() . ' ' . $exc->getMessage());
        }

        return $this->response->created();
    }
    
    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, int $id)
    {
        try {

            // validation
            $this->validate($request, [
                'name' => 'bail|required|max:255'
            ]);

            // get existing record                
            $stack = Stack::find($id);  
            $stack->name = $request->input('name');
            $stack->description = $request->input('description');
            $stack->enabled = true;

            $stack->save();

        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            abort(500, 'There was an error storing the record');
        }

        return $this->response->noContent();
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(int $id)
    {
        try {

            Stack::destroy($id);
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            abort(500, 'There was an error deleting the record');
        }

        return $this->response->noContent();
    }
}
