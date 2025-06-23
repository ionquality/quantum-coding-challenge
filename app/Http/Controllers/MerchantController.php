<?php

namespace App\Http\Controllers;

use App\Http\Requests\MerchantRequest;
use App\Models\Merchant;
use App\Http\Resources\MerchantResource;

use Symfony\Component\HttpFoundation\Response as ResponseAlias;

class MerchantController extends Controller
{
    /**
     * Display a listing of the merchants.
     */
    public function index()
    {
        return MerchantResource::collection(Merchant::all());
    }

    /**
     * Store a newly created merchant in storage.
     */
    public function store(MerchantRequest $request)
    {
        $validated = $request->validated();
        $validated['created_by'] = auth()->id();
        $merchant = Merchant::create($validated);
        return response()->json([
            'success' => true,
            'message' => 'Merchant created successfully.',
            'merchant' => new MerchantResource($merchant)
        ], 201);
    }

    /**
     * Display the specified merchant.
     */
    public function show(Merchant $merchant)
    {
        return new MerchantResource($merchant);
    }

    /**
     * Update the specified merchant in storage.
     */
    public function update(MerchantRequest $request, Merchant $merchant)
    {
        $merchant->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Merchant created successfully.',
            'merchant' => new MerchantResource($merchant)
        ]);
    }

    /**
     * Remove the specified merchant from storage.
     */
    public function destroy(Merchant $merchant)
    {
        $merchant->delete();

        return response()->json(null, ResponseAlias::HTTP_NO_CONTENT);
    }
}
