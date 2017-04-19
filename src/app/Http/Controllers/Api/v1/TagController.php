<?php
namespace App\Http\Controllers\Api\v1;

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
            return response()->json([ 'message' => 'There was an error retrieving the records' ], 500);
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

            $data = Tag::with('cards')->findOrFail($id)->toArray();
           
        } catch (ModelNotFoundException $e) {
            return response()->json([ 'message' => 'Not found' ], 404);
        } catch (\Exception $exc) {
            Log::error(get_class() . ' ' . $exc->getMessage());
            return response()->json([ 'message' => 'There was an error retrieving the record' ], 500);
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
            return response()->json([ 'message' => 'There was an error deleting the record' ], 500);
        }

        return response("", 204);
    }
}
