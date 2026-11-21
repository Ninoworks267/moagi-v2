import os
import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from .models import Booking, Favorite, Message, Property, Report, Review, Stay, User
from .security import hash_password

DEMO_PASSWORD = os.getenv("DEMO_PASSWORD", "Moagi123!")

U = "https://images.unsplash.com/"
P = "?auto=format&fit=crop&w=1400&q=80"

PHOTOS = {
    "apartment1": [U + "photo-1560448204-e02f11c3d0e2" + P, U + "photo-1502672260266-1c1ef2d93688" + P, U + "photo-1493809842364-78817add7ffb" + P],
    "apartment2": [U + "photo-1522708323590-d24dbb6b0267" + P, U + "photo-1567767292278-a4f21aa2d36e" + P, U + "photo-1554995207-c18c203602cb" + P],
    "house1": [U + "photo-1512917774080-9991f1c4c750" + P, U + "photo-1600585154340-be6161a56a0c" + P, U + "photo-1600607687939-ce8a6c25118c" + P],
    "house2": [U + "photo-1568605114967-8130f3a36994" + P, U + "photo-1570129477492-45c003edd2be" + P, U + "photo-1583608205776-bfd35f0d9f83" + P],
    "house3": [U + "photo-1600566753086-00f18fb6b3ea" + P, U + "photo-1600047509807-ba8f99d2cdde" + P, U + "photo-1616486338812-3dadae4b4ace" + P],
    "house4": [U + "photo-1600607687920-4e2a09cf159d" + P, U + "photo-1615874959474-d609969a20ed" + P, U + "photo-1600210492486-724fe5c67fb0" + P],
    "cottage": [U + "photo-1449844908441-8829872d2607" + P, U + "photo-1518780664697-55e3ad937233" + P, U + "photo-1523217582562-09d0def993a6" + P],
    "modern": [U + "photo-1600596542815-ffad4c1539a9" + P, U + "photo-1600607688969-a5bfcd646154" + P, U + "photo-1600585154526-990dced4db0d" + P],
    "stay1": [U + "photo-1520250497591-112f2f40a3f4" + P, U + "photo-1590490360182-c33d57733427" + P, U + "photo-1611892440504-42a792e24d32" + P],
    "stay2": [U + "photo-1566073771259-6a8506099945" + P, U + "photo-1582719508461-905c673771fd" + P, U + "photo-1584132967334-10e028bd69f7" + P],
    "stay3": [U + "photo-1542314831-068cd1dbfeeb" + P, U + "photo-1551882547-ff40c63fe5fa" + P, U + "photo-1445019980597-93fa8acb246c" + P],
    "stay4": [U + "photo-1571896349842-33c89424de2d" + P, U + "photo-1578683010236-d716f9a3f461" + P, U + "photo-1596394516093-501ba68a0ba6" + P],
}

AVATAR = "https://api.dicebear.com/9.x/notionists/svg?seed="


def _avatar(name: str) -> str:
    return AVATAR + name.replace(" ", "%20") + "&backgroundColor=e8f0ea"


def seed(db: Session) -> None:
    from .config import IS_PROD, SEED_DEMO

    if IS_PROD or not SEED_DEMO:
        return
    if not DEMO_PASSWORD:
        raise RuntimeError("Set DEMO_PASSWORD to seed demo data.")
    if db.query(User).count() > 0:
        return

    users = [
        User(first_name="Tiro", surname="Tema", email="admin@moagi.demo", phone="+267 71 000 001", password_hash=hash_password(DEMO_PASSWORD), role="admin", location="Gaborone", bio="MOAGI platform administrator.", avatar_url=_avatar("Tiro Tema")),
        User(first_name="Kago", surname="Molefe", email="kago@moagi.demo", phone="+267 72 100 101", password_hash=hash_password(DEMO_PASSWORD), role="landlord", location="Gaborone", bio="Property owner in Gaborone for over 12 years. I keep my homes clean, safe and ready for you.", avatar_url=_avatar("Kago Molefe")),
        User(first_name="Naledi", surname="Motsumi", email="naledi@moagi.demo", phone="+267 73 200 202", password_hash=hash_password(DEMO_PASSWORD), role="landlord", location="Gaborone", bio="I manage a small portfolio of apartments around Block 8 and Broadhurst. Quick to respond.", avatar_url=_avatar("Naledi Motsumi")),
        User(first_name="Thato", surname="Rantao", email="thato@moagi.demo", phone="+267 74 300 303", password_hash=hash_password(DEMO_PASSWORD), role="landlord", location="Francistown", bio="Francistown born and raised. Family homes with space to breathe.", avatar_url=_avatar("Thato Rantao")),
        User(first_name="Lesego", surname="Dube", email="lesego@moagi.demo", phone="+267 75 400 404", password_hash=hash_password(DEMO_PASSWORD), role="landlord", location="Maun", bio="Your gateway to the Okavango. Quiet, secure homes close to town.", avatar_url=_avatar("Lesego Dube")),
        User(first_name="Mpho", surname="Sebina", email="mpho@moagi.demo", phone="+267 76 500 505", password_hash=hash_password(DEMO_PASSWORD), role="landlord", location="Gaborone", bio="Modern city living in the heart of Gaborone.", avatar_url=_avatar("Mpho Sebina")),
        User(first_name="Boitumelo", surname="Kgosietsile", email="boitumelo@moagi.demo", phone="+267 77 600 606", password_hash=hash_password(DEMO_PASSWORD), role="landlord", location="Kasane", bio="Riverside living and holiday homes in Kasane.", avatar_url=_avatar("Boitumelo Kgosietsile")),
        User(first_name="Demo", surname="Tenant", email="tenant@moagi.demo", phone="+267 71 111 222", password_hash=hash_password(DEMO_PASSWORD), role="tenant", location="Gaborone", bio="Looking for a bright place to call home.", avatar_url=_avatar("Demo Tenant")),
        User(first_name="Kefilwe", surname="Modise", email="kefilwe@moagi.demo", phone="+267 72 222 333", password_hash=hash_password(DEMO_PASSWORD), role="tenant", location="Gaborone", bio="Young professional, neat and quiet.", avatar_url=_avatar("Kefilwe Modise")),
        User(first_name="Onalenna", surname="Ndlovu", email="onalenna@moagi.demo", phone="+267 73 333 444", password_hash=hash_password(DEMO_PASSWORD), role="tenant", location="Maun", bio="Moving to Maun for work.", avatar_url=_avatar("Onalenna Ndlovu")),
    ]
    db.add_all(users)
    db.flush()

    by_email = {u.email: u for u in users}
    kago = by_email["kago@moagi.demo"]
    naledi = by_email["naledi@moagi.demo"]
    thato = by_email["thato@moagi.demo"]
    lesego = by_email["lesego@moagi.demo"]
    mpho = by_email["mpho@moagi.demo"]
    boitu = by_email["boitumelo@moagi.demo"]

    props = [
        dict(landlord=kago, title="Leafy 2-bedroom apartment in Block 8", location="Block 8, Gaborone", city="Gaborone", price=4500, bedrooms=2, bathrooms=1, property_type="Apartment", description="A calm, light-filled apartment tucked into a leafy street in Block 8. Open-plan living, a private balcony and secure parking behind a remote gate. Water included and pre-paid electricity with a smart meter. Walking distance to Block 8 shopping centre.", photos=PHOTOS["apartment1"], amenities=["Fibre internet", "Built-in wardrobes", "Private balcony", "Secure parking", "24h security", "Pre-paid electricity"], furnished=False, parking=True, water_included=True, available_from="Immediately", featured=True),
        dict(landlord=naledi, title="Cosy family home in Broadhurst", location="Broadhurst, Gaborone", city="Gaborone", price=6500, bedrooms=3, bathrooms=2, property_type="House", description="Three generous bedrooms, a big family kitchen and a shaded patio that opens onto a walled garden. Borehole backup keeps the taps running. Two covered parking bays and a separate laundry room. Close to Broadhurst Primary and the main mall.", photos=PHOTOS["house1"], amenities=["Borehole backup", "Walled garden", "Laundry room", "Covered parking", "Pet friendly", "Fibre internet"], furnished=False, parking=True, water_included=True, electricity_included=False, available_from="1 December", featured=True),
        dict(landlord=mpho, title="Modern 1-bedroom in the CBD", location="Central Business District, Gaborone", city="Gaborone", price=5200, bedrooms=1, bathrooms=1, property_type="Apartment", description="City living done right. A sleek one-bedroom on the 6th floor with floor-to-ceiling windows, a gym in the building and a rooftop terrace with skyline views. Fully furnished and ready to move in.", photos=PHOTOS["apartment2"], amenities=["Fully furnished", "Rooftop terrace", "Gym", "Lift access", "Fibre internet", "24h security"], furnished=True, parking=True, water_included=True, electricity_included=True, available_from="Immediately", featured=True),
        dict(landlord=thato, title="Francistown starter home with space to grow", location="Area W, Francistown", city="Francistown", price=3200, bedrooms=2, bathrooms=1, property_type="House", description="A solid two-bedroom home on a generous plot. Big yard for the kids, room for a veggie garden and a lock-up garage. Quiet street, close to schools and public transport. Ideal for a young family or couple.", photos=PHOTOS["house2"], amenities=["Large yard", "Lock-up garage", "Pet friendly", "Borehole", "Pre-paid electricity"], furnished=False, parking=True, water_included=False, available_from="15 November"),
        dict(landlord=lesego, title="Okavango garden cottage", location="Boseja, Maun", city="Maun", price=3800, bedrooms=2, bathrooms=1, property_type="Cottage", description="Peaceful garden cottage with its own entrance, shaded veranda and outdoor seating. Ten minutes from Maun town centre. Fast fibre for remote work and secure parking under a carport.", photos=PHOTOS["cottage"], amenities=["Fibre internet", "Private entrance", "Carport", "Garden", "Water tank"], furnished=True, parking=True, water_included=True, available_from="Immediately", featured=True),
        dict(landlord=kago, title="Spacious 3-bedroom in Phakalane", location="Phakalane, Gaborone", city="Gaborone", price=9500, bedrooms=3, bathrooms=2, property_type="House", description="A modern family home in a quiet Phakalane estate. Open-plan kitchen, scullery, double garage and a landscaped garden with a splash pool. Estate security at the gate and fibre throughout.", photos=PHOTOS["modern"], amenities=["Swimming pool", "Double garage", "Estate security", "Fibre internet", "Scullery", "Pet friendly"], furnished=False, parking=True, water_included=False, electricity_included=False, available_from="1 January", featured=True),
        dict(landlord=naledi, title="Bright garden flat in Extension 12", location="Extension 12, Gaborone", city="Gaborone", price=3900, bedrooms=1, bathrooms=1, property_type="Flat", description="A neat garden flat with its own gate and small private yard. Ideal for a single professional. Water included and safe off-street parking.", photos=PHOTOS["apartment2"], amenities=["Private yard", "Fibre internet", "Secure parking", "Wardrobe"], furnished=False, parking=True, water_included=True, available_from="Immediately"),
        dict(landlord=boitu, title="Riverside family home in Kasane", location="Kasane", city="Kasane", price=5800, bedrooms=3, bathrooms=2, property_type="House", description="Wake up to birdsong and the Chobe river breeze. A generous three-bedroom home with a deep veranda, established trees and space for a boat. Five minutes to the Chobe National Park gate.", photos=PHOTOS["house3"], amenities=["Boat parking", "Veranda", "Large garden", "Water tank", "Pet friendly", "Pre-paid electricity"], furnished=False, parking=True, water_included=False, available_from="1 December"),
        dict(landlord=thato, title="Neat 2-bedroom townhouse in Area S", location="Area S, Francistown", city="Francistown", price=3600, bedrooms=2, bathrooms=2, property_type="Townhouse", description="Low-maintenance townhouse in a small, quiet complex. Two en-suite bedrooms, open-plan living and a private courtyard. Perfect for a small family or two friends sharing.", photos=PHOTOS["house4"], amenities=["En-suite bedrooms", "Private courtyard", "Carport", "Pre-paid electricity"], furnished=False, parking=True, water_included=False, available_from="15 November"),
        dict(landlord=mpho, title="Studio loft in Extension 10", location="Extension 10, Gaborone", city="Gaborone", price=3400, bedrooms=1, bathrooms=1, property_type="Studio", description="Compact and clever studio loft with high ceilings, a sleeping mezzanine and a full kitchen. Furnished, fibre connected and close to the university and shopping centres.", photos=PHOTOS["apartment1"], amenities=["Fully furnished", "Fibre internet", "Mezzanine", "Secure parking"], furnished=True, parking=True, water_included=True, electricity_included=True, available_from="Immediately"),
        dict(landlord=lesego, title="Family home in Maun with borehole", location="Disaneng, Maun", city="Maun", price=4800, bedrooms=3, bathrooms=2, property_type="House", description="Reliable family home with a strong borehole and water storage. Tiled throughout, with a big kitchen and a shaded outdoor entertainment area. Pet friendly and close to primary schools.", photos=PHOTOS["house2"], amenities=["Borehole", "Water tank", "Entertainment area", "Pet friendly", "Carport"], furnished=False, parking=True, water_included=True, available_from="Immediately"),
        dict(landlord=naledi, title="Executive apartment in iTowers", location="CBD, Gaborone", city="Gaborone", price=7800, bedrooms=1, bathrooms=1, property_type="Apartment", description="High-floor apartment in iTowers with skyline views, hotel-style amenities and secure basement parking. Fully furnished for easy city living. Building has a pool, gym and concierge.", photos=PHOTOS["apartment2"], amenities=["Fully furnished", "Pool", "Gym", "Concierge", "Basement parking", "Fibre internet"], furnished=True, parking=True, water_included=True, electricity_included=True, available_from="1 January", featured=True),
        dict(landlord=kago, title="3-bedroom home in Mogoditshane", location="Mogoditshane", city="Gaborone", price=5500, bedrooms=3, bathrooms=2, property_type="House", description="Well-kept family home on the Gaborone west edge. Three bedrooms, a family lounge, dining area and a walled yard with a lemon tree. Quick access to the Western Bypass.", photos=PHOTOS["house4"], amenities=["Walled yard", "Carport", "Fibre internet", "Pre-paid electricity", "Pet friendly"], furnished=False, parking=True, water_included=False, available_from="Immediately"),
        dict(landlord=boitu, title="Chobe guest cottage for long stays", location="Kazungula Road, Kasane", city="Kasane", price=4200, bedrooms=2, bathrooms=1, property_type="Cottage", description="Furnished two-bedroom cottage surrounded by trees, ten minutes from the Kasane riverfront. All-inclusive utilities and weekly cleaning. Ideal for a work contract or quiet sabbatical.", photos=PHOTOS["cottage"], amenities=["Fully furnished", "Utilities included", "Weekly cleaning", "Carport", "Garden"], furnished=True, parking=True, water_included=True, electricity_included=True, available_from="Immediately"),
    ]

    base_categories = [
        "all", "all", "promo", "all", "all", "all", "women",
        "all", "students", "all", "students", "all", "promo", "promo",
    ]
    for data, category in zip(props, base_categories):
        data["category"] = category

    props += [
        dict(landlord=mpho, title="Student studio near UB", location="Near University of Botswana, Gaborone", city="Gaborone", price=2800, bedrooms=1, bathrooms=1, property_type="Studio", category="students", description="A compact, bright studio built for student life. Walk to campus in under fifteen minutes. Comes furnished with a study desk, fast fibre and secure parking. Water included and pre-paid electricity so there are no surprise bills.", photos=PHOTOS["apartment1"], amenities=["Study desk", "Fibre internet", "Fully furnished", "Secure parking", "Pre-paid electricity"], furnished=True, parking=True, water_included=True, available_from="Immediately", featured=True),
        dict(landlord=naledi, title="Shared student house in Bontleng", location="Bontleng, Gaborone", city="Gaborone", price=2200, bedrooms=4, bathrooms=2, property_type="House", category="students", description="A friendly shared house for students, with four bedrooms, two bathrooms and a dedicated study room. Rent is per room. Water and fibre are included, and the yard is walled with a carport for a shared car.", photos=PHOTOS["house2"], amenities=["Study room", "Fibre internet", "Water included", "Walled yard", "Carport", "Furnished"], furnished=True, parking=True, water_included=True, available_from="15 January"),
        dict(landlord=naledi, title="Women-only garden flat in Extension 9", location="Extension 9, Gaborone", city="Gaborone", price=3600, bedrooms=1, bathrooms=1, property_type="Flat", category="women", description="A private, women-only garden flat with its own entrance and a small walled garden. Quiet neighbours, secure off-street parking and fast fibre for working from home. The landlord lives on the property and is quick to help.", photos=PHOTOS["apartment2"], amenities=["Women only", "Private entrance", "Fibre internet", "Secure parking", "Walled garden", "Water included"], furnished=False, parking=True, water_included=True, available_from="Immediately", featured=True),
        dict(landlord=kago, title="Safe women's residence in Block 6", location="Block 6, Gaborone", city="Gaborone", price=3200, bedrooms=2, bathrooms=1, property_type="Apartment", category="women", description="A calm two-bedroom apartment in a women-only block with remote gate access, lighting around the property and a resident caretaker. Close to the main bus route and shops. Water included and pre-paid electricity.", photos=PHOTOS["apartment1"], amenities=["Women only", "24h security", "Fibre internet", "Water included", "Pre-paid electricity", "Resident caretaker"], furnished=False, parking=True, water_included=True, available_from="1 December"),
        dict(landlord=thato, title="Bachelor flat for men in Tlokweng", location="Tlokweng, Gaborone", city="Gaborone", price=3000, bedrooms=1, bathrooms=1, property_type="Flat", category="men", description="A neat bachelor flat for a single man or two friends sharing. Private entrance, secure parking behind a gate and a small braai area. Water included, pre-paid electricity and fibre ready.", photos=PHOTOS["house4"], amenities=["Men only", "Private entrance", "Pre-paid electricity", "Secure parking", "Walled yard", "Braai area"], furnished=False, parking=True, water_included=True, available_from="Immediately"),
        dict(landlord=mpho, title="Men's shared loft near Baisago", location="Gaborone West, Gaborone", city="Gaborone", price=2600, bedrooms=2, bathrooms=1, property_type="Apartment", category="men", description="A furnished two-bedroom loft for male tenants, a short drive from Baisago and the industrial area. Includes beds, desks and a shared kitchen. Secure parking and fast fibre. Rent is per room.", photos=PHOTOS["apartment2"], amenities=["Men only", "Fully furnished", "Fibre internet", "Secure parking", "Shared kitchen"], furnished=True, parking=True, water_included=True, available_from="Immediately"),
        dict(landlord=kago, title="Promo: first month half price in Old Naledi", location="Old Naledi, Gaborone", city="Gaborone", price=2900, bedrooms=2, bathrooms=1, property_type="House", category="promo", description="Move in before the end of the month and get your first month at half price. A solid two-bedroom home with a walled yard, outdoor tap and a quiet street. Ideal for a small family or a couple starting out.", photos=PHOTOS["house2"], amenities=["Walled yard", "Outdoor tap", "Pre-paid electricity", "Carport", "Pet friendly"], furnished=False, parking=True, water_included=False, available_from="Immediately", featured=True),
        dict(landlord=thato, title="Promo: furnished studio in Francistown", location="Area W, Francistown", city="Francistown", price=2500, bedrooms=1, bathrooms=1, property_type="Studio", category="promo", description="Special offer for a six-month lease: a furnished studio with a double bed, kitchenette and workspace. Water and electricity included. Secure parking and a shared laundry area.", photos=PHOTOS["apartment2"], amenities=["Fully furnished", "Utilities included", "Kitchenette", "Workspace", "Secure parking"], furnished=True, parking=True, water_included=True, electricity_included=True, available_from="Immediately"),
        dict(landlord=lesego, title="Student apartment in Maun", location="Boseja, Maun", city="Maun", price=3100, bedrooms=1, bathrooms=1, property_type="Apartment", category="students", description="A quiet one-bedroom apartment suited to students on placement in Maun. Furnished with a desk and bed, fibre connected and close to the main shops. Water included and a shared garden to study in.", photos=PHOTOS["cottage"], amenities=["Study desk", "Fibre internet", "Furnished", "Shared garden", "Water included"], furnished=True, parking=True, water_included=True, available_from="Immediately"),
        dict(landlord=boitu, title="Women's cottage in Kasane", location="Kasane", city="Kasane", price=4200, bedrooms=2, bathrooms=1, property_type="Cottage", category="women", description="A secure, women-only cottage surrounded by trees, ten minutes from the Kasane riverfront. Two bedrooms, a full kitchen and a shaded veranda. Water included and a weekly cleaner can be arranged.", photos=PHOTOS["cottage"], amenities=["Women only", "Private entrance", "Fibre internet", "Water included", "Garden", "Carport"], furnished=True, parking=True, water_included=True, available_from="1 December"),
        dict(landlord=mpho, title="Men's city pad in Gaborone West", location="Gaborone West, Gaborone", city="Gaborone", price=3800, bedrooms=1, bathrooms=1, property_type="Flat", category="men", description="A modern one-bedroom flat for male tenants, close to the CBD and major bus routes. Fully furnished with a queen bed, smart TV and workspace. Building has secure parking and 24-hour access control.", photos=PHOTOS["apartment1"], amenities=["Men only", "Fully furnished", "24h security", "Secure parking", "Fibre internet", "Smart TV"], furnished=True, parking=True, water_included=True, electricity_included=True, available_from="Immediately"),
        dict(landlord=kago, title="Promo: family home in Molepolole", location="Molepolole", city="Molepolole", price=3500, bedrooms=3, bathrooms=2, property_type="House", category="promo", description="Limited-time offer on a three-bedroom family home in Molepolole. Big yard, borehole and a covered patio for weekends. Two months' deposit instead of the usual three if you sign this month.", photos=PHOTOS["house1"], amenities=["Borehole", "Large yard", "Covered patio", "Carport", "Pet friendly"], furnished=False, parking=True, water_included=True, available_from="Immediately"),
    ]

    properties = []
    for i, data in enumerate(props):
        p = Property(**data, created_at=datetime.now(timezone.utc) - timedelta(days=i * 3))
        db.add(p)
        properties.append(p)
    db.flush()

    stays = [
        dict(title="The Mokolodi Ridge Guesthouse", stay_type="Guesthouse", location="Mokolodi, Gaborone", city="Gaborone", price=950, description="A quiet ridge-top guesthouse with eight en-suite rooms, a pool and views over the hills. Breakfast included and airport transfers on request.", photos=PHOTOS["stay1"], amenities=["Breakfast included", "Swimming pool", "Airport transfer", "Free parking", "Wi-Fi"], rating=4.8, review_count=126, guests=2, bedrooms=1),
        dict(title="Chobe River Lodge", stay_type="Lodge", location="Kasane riverfront", city="Kasane", price=1850, description="Wake up to elephants on the riverbank. Riverside chalets with a deck, restaurant and sunset cruises departing from the lodge.", photos=PHOTOS["stay2"], amenities=["River view", "Restaurant", "Sunset cruise", "Pool", "Wi-Fi"], rating=4.9, review_count=203, guests=2, bedrooms=1),
        dict(title="Okavango Delta Safari Camp", stay_type="Lodge", location="Okavango Delta, Maun", city="Maun", price=3200, description="An intimate safari camp with six tented suites, guided mokoro excursions and exceptional food. All meals and two activities per day included.", photos=PHOTOS["stay4"], amenities=["All meals", "Game drives", "Mokoro trips", "Wi-Fi at main area", "Pool"], rating=4.9, review_count=88, guests=2, bedrooms=1),
        dict(title="Broadhurst Garden Suites", stay_type="Airbnb", location="Broadhurst, Gaborone", city="Gaborone", price=780, description="A private garden suite with its own entrance, kitchenette and patio. Self check-in, fast fibre and secure parking. Ten minutes to the airport.", photos=PHOTOS["stay3"], amenities=["Self check-in", "Kitchenette", "Fibre internet", "Patio", "Secure parking"], rating=4.7, review_count=64, guests=2, bedrooms=1),
        dict(title="Francistown City Hotel", stay_type="Hotel", location="City centre, Francistown", city="Francistown", price=1050, description="Comfortable business hotel in the heart of Francistown with a restaurant, conference rooms and a small gym.", photos=PHOTOS["stay1"], amenities=["Restaurant", "Conference rooms", "Gym", "Free parking", "Wi-Fi"], rating=4.5, review_count=142, guests=2, bedrooms=1),
        dict(title="Maun Thamalakane Guesthouse", stay_type="Guesthouse", location="Thamalakane River, Maun", city="Maun", price=890, description="Relaxed riverside guesthouse with a deck over the water, hearty breakfasts and a pool. A great base before or after the Delta.", photos=PHOTOS["stay2"], amenities=["River deck", "Breakfast included", "Pool", "Free parking", "Wi-Fi"], rating=4.6, review_count=97, guests=2, bedrooms=1),
        dict(title="Kasane Family Cottage", stay_type="Airbnb", location="Kasane", city="Kasane", price=1250, description="A whole two-bedroom cottage sleeping four, with a full kitchen, garden and braai area. Ideal for families visiting Chobe.", photos=PHOTOS["stay3"], amenities=["Full kitchen", "Braai area", "Garden", "Family friendly", "Wi-Fi"], rating=4.8, review_count=51, guests=4, bedrooms=2),
        dict(title="Gaborone Airport Loft", stay_type="Airbnb", location="Sir Seretse Khama Airport, Gaborone", city="Gaborone", price=680, description="A stylish loft five minutes from the airport. Fully self-contained with a queen bed, workspace and Netflix. Perfect for a short stopover.", photos=PHOTOS["stay4"], amenities=["Self check-in", "Workspace", "Netflix", "Fast Wi-Fi", "Secure parking"], rating=4.7, review_count=73, guests=2, bedrooms=1),
    ]
    stay_rows = []
    for i, data in enumerate(stays):
        s = Stay(**data, created_at=datetime.now(timezone.utc) - timedelta(days=i * 4))
        db.add(s)
        stay_rows.append(s)
    db.flush()

    demo_tenant = by_email["tenant@moagi.demo"]
    kefilwe = by_email["kefilwe@moagi.demo"]
    onalenna = by_email["onalenna@moagi.demo"]

    reviews = [
        Review(landlord=kago, author=demo_tenant, property_id=properties[0].id, rating=5, comment="Kago was quick to respond and the apartment was exactly as pictured. The water being included is a big win.", created_at=datetime.now(timezone.utc) - timedelta(days=21)),
        Review(landlord=kago, author=kefilwe, property_id=properties[5].id, rating=4, comment="Lovely home in a quiet estate. The pool was a bonus and maintenance issues were sorted within a day.", created_at=datetime.now(timezone.utc) - timedelta(days=60)),
        Review(landlord=naledi, author=kefilwe, property_id=properties[1].id, rating=5, comment="Naledi is a thoughtful landlord. The house was spotless and the borehole really helps during water cuts.", created_at=datetime.now(timezone.utc) - timedelta(days=12)),
        Review(landlord=naledi, author=onalenna, property_id=properties[11].id, rating=4, comment="Smooth handover and a fair deposit return. Would rent from Naledi again.", created_at=datetime.now(timezone.utc) - timedelta(days=40)),
        Review(landlord=mpho, author=demo_tenant, property_id=properties[2].id, rating=5, comment="The CBD apartment exceeded expectations. Rooftop views are unreal at sunset.", created_at=datetime.now(timezone.utc) - timedelta(days=7)),
        Review(landlord=thato, author=kefilwe, property_id=properties[3].id, rating=4, comment="Great value for Francistown. Big yard and a safe neighborhood. Water sometimes needs planning.", created_at=datetime.now(timezone.utc) - timedelta(days=33)),
        Review(landlord=lesego, author=onalenna, property_id=properties[4].id, rating=5, comment="Perfect little cottage for my contract in Maun. Lesego checked in without hovering. Highly recommend.", created_at=datetime.now(timezone.utc) - timedelta(days=18)),
        Review(landlord=boitu, author=demo_tenant, property_id=properties[7].id, rating=5, comment="Kasane is magic and this home made it feel like ours. Veranda mornings are the best.", created_at=datetime.now(timezone.utc) - timedelta(days=55)),
    ]
    db.add_all(reviews)

    messages = [
        (demo_tenant, kago, "Hi Kago, is the Block 8 apartment still available from the 1st?", 6),
        (kago, demo_tenant, "Hi! Yes it is. You're welcome to view it this Saturday morning.", 5),
        (demo_tenant, kago, "Saturday at 10 works for me. Thank you!", 4),
        (kefilwe, naledi, "Good afternoon Naledi, could you share the deposit terms for the Broadhurst home?", 2),
        (naledi, kefilwe, "Hi Kefilwe, it's one month's rent and refundable within 14 days of move-out.", 1),
    ]
    for sender, recipient, body, days in messages:
        db.add(Message(sender_id=sender.id, recipient_id=recipient.id, body=body, created_at=datetime.now(timezone.utc) - timedelta(days=days, hours=days)))

    db.add_all([
        Favorite(user_id=demo_tenant.id, property_id=properties[0].id),
        Favorite(user_id=demo_tenant.id, property_id=properties[4].id),
        Favorite(user_id=demo_tenant.id, property_id=properties[11].id),
    ])

    db.add(Booking(stay_id=stay_rows[0].id, user_id=demo_tenant.id, checkin="2026-12-18", checkout="2026-12-21", guests=2, nights=3, total=2850, phone=demo_tenant.phone, method="MyZaka", reference="MGG-DEMO-001", status="confirmed"))

    db.add(Report(reporter_id=demo_tenant.id, target_user_id=thato.id, property_id=properties[3].id, category="Misleading listing", details="The photos were taken a while ago and the yard looks different now. Please verify the listing.", status="open", created_at=datetime.now(timezone.utc) - timedelta(days=2)))

    db.commit()
