<?php
namespace App\Http\Controllers\Api;

use App\Stack;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class StackController extends Controller
{

    /**
     * List stacks
     * 
     * @return json
     */
    public function getAll()
    {

        try {

            $data = Stack::all();
            $status = 'success';

            $msg = 'Ok';
            ;
        } catch (Exception $exc) {

            $status = 'error';
            $msg = 'There was an error retrieving records';
        }

        return compact('status', 'msg', 'data');
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
    public function get(Request $request, int $id)
    {
        try {

            $lightweight = filter_input(INPUT_GET, 'lightweight', FILTER_VALIDATE_BOOLEAN);

            if ($lightweight) {

                // retrieving lightweight data from DB
                $data = Stack::lightweight()->findOrFail($id);

                $cards = $data->cards->pluck('id')->all();
           
                // replacing object data with grouped lightweight data
                $data = $data->toArray();
                $data['cards'] = $cards;
            } else {

                $data = Stack::with('cards')->findOrFail($id)->toArray();
            }

            $status = 'success';
            $msg = count($data['cards']) . ' cards';
        } catch (ModelNotFoundException $e) {

            $status = 'error';
            $msg = 'Not found';
        } catch (Exception $exc) {

            $status = 'error';
            $msg = 'There was an error retrieving the record';
        }

        return compact('status', 'msg', 'data');
    }

    public function save(Request $request, int $id = null)
    {
        try {

            // validation
            $this->validate($request, [
                'name' => 'required|max:255'
            ]);

            // get new or existing record                
            $stack = Stack::find($id);
            if (empty($stack)) {
                $stack = new Stack;
            }

            // map data
            $stack->name = $request->input('name');
            $stack->description = $request->input('description');
            $stack->enabled = true;

            $stack->save();

            // response
            $status = 'success';
            $msg = 'Saved';

            $id = $stack->id;
        } catch (Exception $exc) {
            $status = 'error';
            $msg = 'There was an error saving the record';
        }

        return compact('status', 'msg', 'id');
    }

    public function delete(int $id)
    {
        try {

            Stack::destroy($id);
            $status = 'success';
            $msg = 'Deleted';
        } catch (Exception $exc) {

            $status = 'error';
            $msg = 'There was an error deleting the record';
        }

        return compact('status', 'msg');
    }
}
