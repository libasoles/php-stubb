<?php
namespace App\Http\Controllers\Api;

use App\Tag;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class TagController extends Controller
{

    public function getAll()
    {

        try {

            $data = Tag::all();
            $status = 'success';

            $msg = count($data) . ' results';
        } catch (Exception $exc) {

            $status = 'error';
            $msg = 'There was an error retrieving records';
        }

        return compact('status', 'msg', 'data');
    }

    /**
     * Get a single Tag
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
                $data = Tag::lightweight()->findOrFail($id);

                $cards = $data->cards->pluck('id')->all();

                // replacing object data with grouped lightweight data
                $data = $data->toArray();
                $data['cards'] = $cards;
            } else {

                $data = Tag::with('cards')->findOrFail($id)->toArray();
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

    public function delete(int $id)
    {
        try {

            Tag::destroy($id);
            $status = 'success';
            $msg = 'Deleted';
        } catch (Exception $exc) {

            $status = 'error';
            $msg = 'There was an error deleting the record';
        }

        return compact('status', 'msg');
    }
}
