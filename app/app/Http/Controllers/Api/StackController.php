<?php
namespace App\Http\Controllers\Api;

use App\Stack;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class StackController extends Controller
{

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

    public function get(Request $request, int $id)
    {
        try {

            $lightweight = filter_input(INPUT_GET, 'lightweight', FILTER_VALIDATE_BOOLEAN);

            if (!$lightweight) {

                $data = Stack::with('cards')->findOrFail($id);
            } else {
                // retrieving light weight data from DB
                $data = Stack::with(['cards' => function($query) {
                            $query->select('id');
                        }])->findOrFail($id);

                // grouping ids in a single array
                $cards = array_map(function(\App\Card $card) {
                    return $card->id;
                }, $data->cards->all());

                // replacing object data with mapped data
                $data = $data->toArray();
                $data['cards'] = $cards;
            }

            $status = 'success';
            $msg = $lightweight ? 'with all cards info' : 'lightweight';
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
