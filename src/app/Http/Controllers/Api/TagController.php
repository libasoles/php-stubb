<?php
namespace App\Http\Controllers\Api;

use App\Tag;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Log;

class TagController extends Controller
{

    /**
     * Display a listing of the tags.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $data = [];
        
        try {

            $data = Tag::all();
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            abort(500, 'There was an error retrieving the records'); 
        }

        return $data;
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
    public function show(Request $request, int $id)
    {
        $data = [];
        
        try {

            $lightweight = filter_input(INPUT_GET, 'lightweight', FILTER_VALIDATE_BOOLEAN);

            if ($lightweight) {

                // retrieving lightweight data from DB
                $data = Tag::lightweight()->findOrFail($id);

                $cards = $data->cards->pluck('id')->all();

                // replacing object data with grouped lightweight data
                $data = $data->toArray();
            } else {

                $data = Tag::with('cards')->findOrFail($id)->toArray();
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
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(int $id)
    {
        try {

            Tag::destroy($id);
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            abort(500, 'There was an error deleting the record');
        }

        return $this->response->noContent();
    }
}
