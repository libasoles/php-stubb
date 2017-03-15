<?php
namespace App\Http\Controllers\Api;

use App\Card;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Http\Request;

class CardController extends Controller
{
    use ValidatesRequests;

    public function getAll()
    {

        try {

            $data = Card::all();
            $status = 'success';

            $msg = count($data) . ' results';
        } catch (Exception $exc) {

            $status = 'error';
            $msg = 'There was an error retrieving records';
        }

        return compact('status', 'msg', 'data');
    }

    public function get(int $id)
    {
        try {

            $data = Card::findOrFail($id);

            $status = 'success';
            $msg = 'Ok';
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
                'name' => 'max:255',
                'content' => 'required'
            ]);

            // get new or existing record                
            $card = Card::find($id);
            if (empty($card)) {
                $card = new Card;
            }            

            // map data
            $card->name = $request->input('name');
            $card->content = $request->input('content');
            $card->enabled = true;

            $card->save();
            
            // response
            $status = 'success';
            $msg = 'Saved';

            $id = $card->id;
        } catch (Exception $exc) {
            $status = 'error';
            $msg = 'There was an error saving the record';
        }

        return compact('status', 'msg', 'id');
    }

    public function delete(int $id)
    {
        try {

            Card::destroy($id);
            $status = 'success';
            $msg = 'Deleted';
     
        } catch (Exception $exc) {

            $status = 'error';
            $msg = 'There was an error deleting the record';
        }

        return compact('status', 'msg');
    }
}
